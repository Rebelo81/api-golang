import { useEffect, useMemo, useState } from 'react';
import { api } from './services/api';
import { demoProducts } from './data/demoProducts';
import type { Product } from './types/product';
import './styles.css';

type CartItem = Product & { quantity: number };
type ApiStatus = 'checking' | 'online' | 'offline';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getProductImage(product: Product) {
  return (
    product.image_url ||
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80'
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.category || 'Outros'));
    return ['Todos', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch) ||
        product.category?.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  const cartQuantity = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const [health, list] = await Promise.all([api.health(), api.listProducts()]);
      setApiStatus(health.status === 'ok' ? 'online' : 'offline');
      setProducts(list);
    } catch {
      setApiStatus('offline');
      setProducts(demoProducts);
      setError('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function getAvailableStock(product: Product) {
    const cartItem = cart.find((item) => item.id === product.id);
    return product.stock - (cartItem?.quantity ?? 0);
  }

  function addToCart(product: Product) {
    if (getAvailableStock(product) <= 0) {
      notify('Estoque máximo atingido para este produto.');
      return;
    }

    setCart((currentCart) => {
      const currentItem = currentCart.find((item) => item.id === product.id);

      if (!currentItem) {
        return [...currentCart, { ...product, quantity: 1 }];
      }

      return currentCart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });

    setIsCartOpen(true);
    notify(`${product.name} adicionado ao carrinho.`);
  }

  function decreaseQuantity(productId: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: number) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  async function finishOrder() {
    if (cart.length === 0) {
      notify('Adicione produtos antes de finalizar.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      if (apiStatus === 'online') {
        await Promise.all(
          cart.map((item) =>
            api.updateProduct(item.id, {
              name: item.name,
              description: item.description ?? '',
              category: item.category ?? '',
              image_url: item.image_url ?? '',
              price: item.price,
              stock: item.stock - item.quantity,
            }),
          ),
        );

        await loadProducts();
        notify('Pedido finalizado. Estoque atualizado na API.');
      } else {
        setProducts((currentProducts) =>
          currentProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            return cartItem ? { ...product, stock: product.stock - cartItem.quantity } : product;
          }),
        );
        notify('Pedido finalizado em modo demonstração.');
      }

      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível finalizar o pedido.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="store-shell">
      {toast && <div className="toast">{toast}</div>}

      <header className="hero">
        <nav className="topbar">
          <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="brand-mark">⌘</span>
            <strong>dev store</strong>
          </button>

          <div className="top-actions">
            <button className="cart-button" type="button" onClick={() => setIsCartOpen(true)}>
              Carrinho · {cartQuantity}
            </button>
          </div>
        </nav>

        <section className="hero-content">
          <div>
            <p className="eyebrow">Ultra tech gear for builders</p>
            <h1>Equipamentos premium para desenvolvedores.</h1>
            <p className="subtitle">
              Curadoria minimalista com notebooks, periféricos, ergonomia, storage,
              homelab e produtividade para quem constrói software todos os dias.
            </p>
            <div className="hero-actions">
              <button type="button" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                Explorar catálogo
              </button>
              <button type="button" onClick={() => setIsCartOpen(true)}>Ver carrinho</button>
            </div>
          </div>

          <aside className="cart-panel">
            <p>Seu carrinho</p>
            <strong>{formatCurrency(cartTotal)}</strong>
            <span>{cartQuantity} item(ns) selecionado(s)</span>
          </aside>
        </section>
      </header>

      <section className="toolbar" id="catalog">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar notebooks, teclados, homelab..."
          />
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={category === selectedCategory ? 'active' : ''}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="notice error">{error}. Confirme se o backend está rodando.</div>}

      {loading ? (
        <section className="product-grid">
          {Array.from({ length: 8 }).map((_, index) => <article className="product-card skeleton" key={index} />)}
        </section>
      ) : (
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <button className="image-frame" type="button" onClick={() => setSelectedProduct(product)}>
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  loading="lazy"
                />
                <span>{product.category || 'Dev Gear'}</span>
              </button>

              <div className="product-info">
                <div>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                </div>

                <div className="product-footer">
                  <div>
                    <strong>{formatCurrency(product.price)}</strong>
                    <small>{getAvailableStock(product)} disponível(is)</small>
                  </div>

                  <div className="product-actions">
                    <button type="button" className="secondary" onClick={() => setSelectedProduct(product)}>
                      Detalhes
                    </button>
                    <button type="button" disabled={getAvailableStock(product) <= 0} onClick={() => addToCart(product)}>
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Checkout</p>
            <h2>Carrinho</h2>
          </div>
          <button type="button" onClick={() => setIsCartOpen(false)}>Fechar</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">Seu carrinho está vazio.</div>
        ) : (
          <div className="drawer-items">
            {cart.map((item) => (
              <article key={item.id} className="drawer-item">
                <img src={getProductImage(item)} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <small>{formatCurrency(item.price)}</small>
                  <div className="quantity-controls">
                    <button type="button" onClick={() => decreaseQuantity(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => addToCart(item)}>+</button>
                    <button type="button" onClick={() => removeFromCart(item.id)}>Remover</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="drawer-footer">
          <div>
            <span>Total</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
          <button type="button" disabled={processing || cart.length === 0} onClick={finishOrder}>
            {processing ? 'Processando...' : 'Finalizar compra'}
          </button>
        </div>
      </aside>

      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <article className="product-modal" onClick={(event) => event.stopPropagation()}>
            <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
            <div>
              <p className="eyebrow">{selectedProduct.category}</p>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <strong>{formatCurrency(selectedProduct.price)}</strong>
              <small>{getAvailableStock(selectedProduct)} unidade(s) disponível(is)</small>
              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedProduct(null)}>Voltar</button>
                <button type="button" onClick={() => addToCart(selectedProduct)}>Adicionar ao carrinho</button>
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

export default App;
