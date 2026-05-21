# Go CRUD Backend

Backend REST completo em Go para CRUD de produtos, pronto para abrir no GoLand.

## Rodar o backend

```bash
cd go-crud-backend
go run ./cmd/api
```

API: `http://localhost:8080`

## Rodar o frontend

O frontend foi criado como **Dev Store**, uma loja minimalista e tecnológica em React + TypeScript com Vite, integrada ao backend Go via REST.

Em outro terminal:

```bash
cd go-crud-backend/frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Por padrão, o Vite faz proxy das rotas `/api` e `/health` para `http://localhost:8080`.

A API carrega automaticamente um catálogo inicial com 50 produtos reais para desenvolvedores, incluindo preços, estoque, categorias e fotos.

Se quiser apontar diretamente para outra URL da API, crie um arquivo `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Deploy na Vercel para testes

O projeto já possui `vercel.json` configurado na raiz para publicar o frontend da **Dev Store**.

A aplicação funciona em dois modos:

- **Com backend público**: defina `VITE_API_BASE_URL` na Vercel apontando para a URL da API Go.
- **Modo demonstração**: se a API não estiver pública, a loja carrega automaticamente 50 produtos demo com imagens reais e o carrinho funciona localmente para apresentação.

### Configuração recomendada na Vercel

1. Acesse <https://vercel.com/new>
2. Importe o repositório `Rebelo81/api-golang`
3. Mantenha as configurações detectadas pelo `vercel.json`
4. Clique em **Deploy**

Se tiver backend publicado, adicione em **Project Settings > Environment Variables**:

```env
VITE_API_BASE_URL=https://sua-api-publica.com
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/products` | Lista produtos |
| POST | `/api/v1/products` | Cria produto |
| GET | `/api/v1/products/{id}` | Busca produto por ID |
| PUT | `/api/v1/products/{id}` | Atualiza produto |
| DELETE | `/api/v1/products/{id}` | Remove produto |

## Exemplo de produto

```json
{
  "name": "Notebook",
  "description": "Notebook para desenvolvimento",
  "category": "Notebooks",
  "image_url": "https://source.unsplash.com/900x900/?laptop,developer",
  "price": 4500.50,
  "stock": 10
}
```

## Testar com curl

Criar:

```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","description":"Notebook para desenvolvimento","category":"Notebooks","image_url":"https://source.unsplash.com/900x900/?laptop,developer","price":4500.50,"stock":10}'
```

Listar:

```bash
curl http://localhost:8080/api/v1/products
```

Buscar:

```bash
curl http://localhost:8080/api/v1/products/1
```

Atualizar:

```bash
curl -X PUT http://localhost:8080/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook Pro","description":"Atualizado","category":"Notebooks","image_url":"https://source.unsplash.com/900x900/?laptop,developer","price":5200,"stock":8}'
```

Excluir:

```bash
curl -X DELETE http://localhost:8080/api/v1/products/1
```

## Insomnia / documentação profissional da API

Este projeto possui dois arquivos para testar a API no Insomnia:

- `insomnia_collection.json`: coleção pronta com todas as requisições.
- `docs/openapi.yaml`: contrato OpenAPI 3.0 com contexto do backend, schemas, exemplos e respostas.

### Importar no Insomnia

Opção recomendada:

1. Abra o Insomnia.
2. Clique em **Create / Import**.
3. Selecione **Import from File**.
4. Importe o arquivo `docs/openapi.yaml`.

Também é possível importar diretamente a coleção `insomnia_collection.json`.

### Ambiente local

A API roda por padrão em:

```txt
http://localhost:8080
```

Fluxo sugerido de testes:

1. `Health Check`
2. `Criar produto`
3. `Listar produtos`
4. `Buscar produto por ID`
5. `Atualizar produto`
6. `Excluir produto`

## Abrir no GoLand

Abra a pasta `go-crud-backend` como projeto. O arquivo principal fica em:

`cmd/api/main.go`
