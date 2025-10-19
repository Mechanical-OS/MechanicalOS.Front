# 📖 Advanced Table - Guia de Paginação

## Como Usar Paginação Corretamente

### ✅ Paginação Server-Side (Recomendado para grandes volumes de dados)

#### 1. No Component TypeScript (`.ts`)

```typescript
export class MeuComponent implements OnInit {
  // Propriedades necessárias
  dataList: any[] = [];           // Array com os dados da página atual
  totalRecords: number = 0;       // Total de registros na API
  columns: Column[] = [];         // Definição das colunas

  async loadData(pageIndex: number = 1, pageSize: number = 10): Promise<void> {
    const request: GetAllRequest = {
      pageSize: pageSize,
      pageIndex: pageIndex,  // ⚠️ Verificar se sua API usa base 0 ou base 1
      sort: '',
      direction: ''
    };

    const result = await firstValueFrom(this.service.getAll(request));
    if (result.statusCode === 200) {
      this.dataList = result.content.resultList;      // ✅ Salvar apenas os registros da página
      this.totalRecords = result.content.totalRecords; // ✅ Salvar o total geral
    }
  }

  // Método chamado quando o usuário muda de página
  onPageChange(page: number): void {
    // Se sua API usa base 0 (pageIndex: 0, 1, 2...)
    this.loadData(page - 1, 10);
    
    // Se sua API usa base 1 (pageIndex: 1, 2, 3...)
    // this.loadData(page, 10);
  }

  ngOnInit(): void {
    this.loadData(); // Carrega a primeira página
  }
}
```

#### 2. No Template HTML (`.html`)

```html
<app-advanced-table 
  [tableData]="dataList"
  [totalRecords]="totalRecords"          <!-- ⭐ OBRIGATÓRIO para paginação server-side -->
  [columns]="columns"
  [pagination]="true"
  (pageChange)="onPageChange($event)"    <!-- ⭐ OBRIGATÓRIO para carregar novas páginas -->
  [isSearchable]="true"
  [isSortable]="false"
  tableClasses="table-centered"
  theadClasses="table-light">
</app-advanced-table>
```

---

### 📌 Inputs Obrigatórios para Paginação

| Input | Tipo | Descrição |
|-------|------|-----------|
| `[tableData]` | `any[]` | Array com os dados **da página atual** (ex: 10 registros) |
| `[totalRecords]` | `number` | Total geral de registros na base de dados (ex: 40) |
| `[pagination]` | `boolean` | `true` para ativar a paginação |

### 📌 Outputs Obrigatórios para Paginação

| Output | Tipo | Descrição |
|--------|------|-----------|
| `(pageChange)` | `number` | Emitido quando o usuário muda de página. Recebe o número da página (base 1) |

---

## ⚠️ IMPORTANTE: Base do PageIndex

### Se a API usa base 0 (0, 1, 2, 3...):
```typescript
onPageChange(page: number): void {
  this.loadData(page - 1, 10);  // ✅ Subtrai 1
}
```

**Exemplo:**
- Usuário clica na página 2 → `page = 2`
- Envia para API: `pageIndex = 1` (página 2 na base 0)

### Se a API usa base 1 (1, 2, 3, 4...):
```typescript
onPageChange(page: number): void {
  this.loadData(page, 10);  // ✅ Usa diretamente
}
```

**Exemplo:**
- Usuário clica na página 2 → `page = 2`
- Envia para API: `pageIndex = 2`

---

## 🔍 Como Identificar a Base da API?

Verifique a resposta da API na primeira requisição:

```json
{
  "totalRecords": 40,
  "pageIndex": 0,      // ← Se for 0, a API usa base 0
  "pageSize": 10,
  "resultList": [...]
}
```

ou

```json
{
  "totalRecords": 40,
  "pageIndex": 1,      // ← Se for 1, a API usa base 1
  "pageSize": 10,
  "resultList": [...]
}
```

---

## ✅ Checklist Rápido

- [ ] Propriedade `totalRecords` criada no componente
- [ ] `totalRecords` sendo salvo da resposta da API
- [ ] `[totalRecords]="totalRecords"` no template HTML
- [ ] Método `onPageChange(page: number)` criado
- [ ] `(pageChange)="onPageChange($event)"` no template HTML
- [ ] Verificada a base do pageIndex (0 ou 1)
- [ ] Ajustado `page - 1` ou `page` conforme necessário

---

## 📝 Exemplo Completo

**services.component.ts:**
```typescript
export class ServicesComponent implements OnInit {
  serviceList: ServiceModel[] = [];
  totalRecords: number = 0;
  columns: Column[] = [];

  async _fetchData(pageIndex: number = 1, pageSize: number = 10): Promise<void> {
    const request: GetAllRequest = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      sort: '',
      direction: ''
    };

    const result = await firstValueFrom(this.service.getAll(request));
    if (result.statusCode === 200) {
      this.serviceList = result.content.resultList;
      this.totalRecords = result.content.totalRecords;
    }
  }

  onPageChange(page: number): void {
    this._fetchData(page, 10); // API usa base 1
  }

  ngOnInit(): void {
    this._fetchData();
  }
}
```

**services.component.html:**
```html
<app-advanced-table 
  [tableData]="serviceList"
  [totalRecords]="totalRecords"
  [columns]="columns"
  [pagination]="true"
  (pageChange)="onPageChange($event)"
  [isSearchable]="true">
</app-advanced-table>
```

---

## 🎯 Resultado Esperado

Ao seguir este guia, você verá:

```
Mostrando 1 de 10 de 40 registros
[1] [2] [3] [4]
```

E ao clicar nas páginas, novas requisições serão feitas à API carregando os dados corretos! ✅

