# State inventory — issue triage board

Инвентарь фиксирует не Hook, а семантику значения: owner, lifetime, source of
truth и update authority.

| Value | Класс | Owner / source of truth | Lifetime | Update authority |
|---|---|---|---|---|
| `filters.query` | URL state | `window.location.search`, ключ `q` | Reload, share-link, Back/Forward | Search input через `replaceState`; browser navigation |
| `filters.status` | URL state | `window.location.search`, ключ `status` | Reload, share-link, Back/Forward | Status select через `pushState`; browser navigation |
| `filters.priority` | URL state | `window.location.search`, ключ `priority` | Reload, share-link, Back/Forward | Priority select через `pushState`; browser navigation |
| `selectedIssueId` | Local, lifted | `App` | До unmount приложения или явного close | Issue card и Close callback |
| `selectedIssue` | Derived | `issuesQuery.data + selectedIssueId` | Один render | Никто; пересчитывается `find` |
| `visibleIssues` | Derived | `issuesQuery.data + filters` | Один render | Никто; пересчитывается `filterIssues` |
| `counts` | Derived | `issuesQuery.data` | Один render | Никто; пересчитывается `summarizeIssues` |
| `query.status` | Server-cache metadata | `issuesCache` | Между подписчиками текущей page session | Query lifecycle: idle/loading/success/error |
| `query.data` | Server cache | API — authority; cache — локальный snapshot | Cache session; может устареть | `getIssues` и успешный `updateIssue` |
| `query.error` | Server-cache metadata | `issuesCache` | До следующего query attempt | Rejected query / retry |
| `query.lastUpdated` | Server-cache metadata | `issuesCache` | До следующего успешного response | Успешный query/mutation |
| `editor.fields` | Reducer / local draft | Конкретный keyed `IssueEditor` | Пока выбран тот же issue | `field_changed` actions |
| `editor.step` | Reducer workflow | Конкретный keyed `IssueEditor` | Пока выбран тот же issue | `next` и `back` actions |
| `editor.errors` | Reducer workflow | Конкретный keyed `IssueEditor` | До исправления поля или новой validation | `next` и `field_changed` |
| `editor.submitStatus` | Reducer workflow | Конкретный keyed `IssueEditor` | Один save attempt / до новой правки | `submit_started/succeeded/failed` |

## Осознанно отсутствующий state

- Нет `filteredIssues` state: список выводится из cache + URL.
- Нет `selectedIssue` state: хранится только стабильный ID.
- Нет отдельного `hasFilters`: вычисляется из URL filters.
- Нет `isReviewing`, `isSaving`, `isSaved`, `hasError` как независимых booleans:
  один `step` и один `submitStatus` исключают невозможные комбинации.
- Нет Context: глубина дерева и количество consumers не оправдывают provider.

## Учебная граница

`issuesApi.js` — in-memory имитация сервера с задержкой. Она демонстрирует
ownership и async lifecycle, но не обеспечивает persistence после reload и не
доказывает интеграцию с настоящим backend.
