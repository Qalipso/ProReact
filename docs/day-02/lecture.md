# Лекция: как проектировать state, а не складывать его в одну коробку

## Результат занятия

После занятия вы должны уметь посмотреть на любое значение интерфейса и ответить
на четыре вопроса:

1. Это факт или вычисление из других фактов?
2. Кто минимальный владелец значения?
3. Как долго значение должно жить?
4. Кто имеет право его менять?

Выбор `useState`, reducer, Context, URL или server cache — следствие этих
ответов, а не отправная точка.

## 1. State — минимальная память, необходимая интерфейсу

React-компонент на каждом render получает snapshot props, state и context и
вычисляет UI. Если значение можно дешёво получить из уже имеющихся входов, это
не новый state.

В triage board:

```js
const visibleIssues = filterIssues(issuesQuery.data, filters)
const selectedIssue = issuesQuery.data.find(
  (issue) => issue.id === selectedIssueId,
)
```

`visibleIssues` и `selectedIssue` — **derived values**. Они не имеют собственного
владельца, lifetime и update authority. Они пересчитываются во время render.

Опасный вариант:

```js
const [selectedIssue, setSelectedIssue] = useState(issues[0])
```

Теперь один issue существует и в `issues`, и в `selectedIssue`. После server
update один объект может стать новым, а второй остаться старым. Чтобы не чинить
синхронизацию, мы храним только `selectedIssueId`.

## 2. Три оси классификации

### Ownership — кто должен координировать изменение

- Один leaf-компонент использует значение — colocate state в нём.
- Два sibling-компонента должны согласованно видеть значение — lift state в их
  ближайшего общего родителя.
- Много далёких компонентов только читают общее значение — Context может
  доставить его, но Context сам по себе не определяет владельца.
- Значение принадлежит внешней системе — владелец не React-компонент.

В приложении `selectedIssueId` принадлежит `App`, потому что список создаёт
selection, а editor читает его. Если selection был бы нужен только одной
карточке, lifting был бы лишним.

### Lifetime — когда значение обязано исчезнуть

- До размонтирования компонента: local state.
- До смены выбранной сущности: keyed local state.
- Через reload, share-link и Back/Forward: URL state.
- Между подписчиками и повторными mounts: cache state.
- Постоянно и для других клиентов: server/database state.

Editor получает `key={selectedIssue.id}`. При выборе другого issue меняется
identity компонента, и локальный draft намеренно сбрасывается.

### Source of truth — где принимается окончательное решение

- URL решает, какие фильтры активны.
- React owner решает, какой ID выбран.
- API/server решает, какие issue существуют и что в них сохранено.
- Reducer решает, в каком состоянии находится локальный workflow draft.
- Derived value ничего не решает: оно следует за источниками.

Single source of truth не означает «весь state наверху». Это означает ровно
одного авторитетного владельца **для каждого отдельного факта**.

## 3. Алгоритм выбора места

Пройдите вопросы по порядку:

1. **Значение пришло с сервера?** Используйте query/server cache. Не копируйте
   response в глобальный client store без конкретной причины.
2. **Оно должно пережить reload, попасть в ссылку или работать с Back/Forward?**
   Это кандидат в URL.
3. **Его можно получить из существующих props/state/cache/URL?** Вычислите во
   время render.
4. **Оно нужно только одному компоненту?** Оставьте local.
5. **Несколько соседних компонентов должны координироваться?** Lift в ближайшего
   общего родителя и передайте callbacks владельцу.
6. **Переходов много и правила размазались по handlers?** Соберите transitions
   в reducer.
7. **Props приходится передавать через много незаинтересованных уровней?**
   Рассмотрите Context — после того как owner уже определён.

Главный критерий: состояние должно находиться настолько низко, насколько
возможно, но настолько высоко, насколько необходимо.

## 4. Пять видов state в triage board

### Local state: selection

```js
const [selectedIssueId, setSelectedIssueId] = useState(null)
```

Selection — временная деталь текущего UI. Она не нужна в ссылке, серверу или
другому экрану. Хранится ID, а не дубликат issue.

### Lifted state: координация list и editor

`IssueCard` сообщает событие наверх через `onSelect`. `App` обновляет
`selectedIssueId`, затем передаёт найденный issue в `IssueEditor`. Дети не
пытаются синхронизировать две независимые копии selection.

### Derived state: список, счётчики и выбранный объект

`visibleIssues`, `counts`, `selectedIssue` вычисляются из server snapshot, URL
filters и local ID. Они всегда относятся к одному render snapshot, поэтому не
нужны эффекты вида «когда изменились issues, обнови filteredIssues».

`useMemo` тоже не превращает значение в state: это только возможная оптимизация
вычисления. Сначала добейтесь правильной модели, затем измеряйте стоимость.

### URL state: filters

URL содержит только отклонения от defaults:

```text
?q=audit&status=open&priority=high
```

`useUrlFilters` подписывается на внешний browser store через
`useSyncExternalStore`. Select использует `pushState`, поэтому Back/Forward
восстанавливает фильтр. Набор текста использует `replaceState`, чтобы каждую
букву не превращать в отдельную history entry.

Зачем URL, а не обычный `useState`:

- ссылка воспроизводит тот же view;
- reload не теряет фильтр;
- browser navigation работает ожидаемо;
- существует один authority, а не `searchParams + synchronized useState`.

### Server state: issues и cache

Issue data имеет другого владельца, асинхронный lifecycle и может устареть.
Поэтому cache хранит не только `data`, но и query metadata:

```js
{ status, data, error, lastUpdated }
```

Компоненты подписываются на cache snapshot. Mutation сначала проходит через
API boundary и только после успешного ответа обновляет cache. В учебном проекте
`issuesApi.js` имитирует backend в памяти процесса; это не доказательство
реального persistence. В production этот boundary заменяется HTTP API, а
самописный cache обычно — TanStack Query, SWR или framework data layer.

Server state отличается от global client state:

- server state принадлежит удалённой системе и cache может быть stale;
- global client state принадлежит текущему клиенту: theme, unsaved workflow,
  feature preference;
- глобальная доступность не меняет ownership. То, что данные нужны везде, не
  делает серверные данные клиентскими.

### Reducer state: multi-step editor

Editor объединяет связанные поля, текущий step, validation errors и submit
status. Все допустимые переходы названы actions:

```text
field_changed → next → submit_started → submit_succeeded
                     ↘ submit_failed
review → back → details
```

Reducer полезен не потому, что полей много, а потому, что переходы образуют
workflow и должны изменять несколько связанных значений согласованно.

Reducer обязан быть pure. Network request находится в event handler:

```js
dispatch({ type: 'submit_started' })
await saveIssue(issue.id, editor.fields)
dispatch({ type: 'submit_succeeded' })
```

Если выполнить request внутри reducer, одинаковые `(state, action)` перестанут
гарантировать одинаковый результат и reducer станет трудно тестировать.

## 5. Когда Context становится неправильным инструментом

Context решает проблему доставки значения, а не автоматически проблему state
management.

Context начинает мешать, когда:

- state нужен только в небольшой ветке и обычная composition яснее;
- один большой provider содержит часто меняющийся несвязанный state и вызывает
  широкие rerenders;
- Context маскирует неизвестного owner — обновлять значение могут все;
- в Context копируется server response вместо query cache;
- Context используется для derived values, которые проще вычислить рядом.

Хорошие кандидаты: theme, locale, authenticated principal, стабильные services,
узкий reducer для действительно общей подветки. В этой лабораторной Context не
нужен: дерево неглубокое, owner каждого значения виден, callbacks короткие.

## 6. Почему synchronized duplicate state опасен

Представим:

```js
const [issues, setIssues] = useState(serverIssues)
const [filteredIssues, setFilteredIssues] = useState(issues)
const [selectedIssue, setSelectedIssue] = useState(issues[0])
```

После сохранения issue требуется атомарно обновить три места. Между updates
render может увидеть несовместимую комбинацию: новая `issues`, старые
`filteredIssues`, старый `selectedIssue`. Новый event handler или error path
легко забудет одну из копий.

Правильная нормализация:

```js
const issues = query.data
const filteredIssues = filterIssues(issues, filters)
const selectedIssue = issues.find((issue) => issue.id === selectedIssueId)
```

Количество синхронизационных правил стало нулём.

## 7. Timeline одного сохранения

1. Пользователь редактирует поле.
2. Handler dispatch-ит `field_changed`.
3. React ставит update в queue; текущий handler всё ещё видит snapshot текущего
   render.
4. Render вызывает pure reducer и строит следующий editor UI.
5. Пользователь переходит на Review — reducer валидирует draft одним transition.
6. Нажатие Save dispatch-ит `submit_started` и запускает side effect через API.
7. После ответа server cache публикует новый snapshot.
8. `App` render-ит новую issue card; `selectedIssue` автоматически находится в
   обновлённом cache.
9. Reducer получает `submit_succeeded`; React commit-ит success message.
10. Браузер показывает закоммиченный DOM.

Здесь render и reconciliation — работа React до commit. Фактический paint/show
делает браузер после commit.

## 8. Карта кода

- `src/App.jsx` — composition, local selection, derived projections, editor UI.
- `src/urlFilters.js` — URL как внешний store и browser history updates.
- `src/issuesApi.js` — учебная граница удалённого источника истины.
- `src/issuesCache.js` — query snapshot, подписки, loading/error/mutation.
- `src/state.js` — pure parsing, derivation, validation и reducer.
- `test/state.test.js` — проверка pure rules без браузера.

## 9. NO-AI verbal interview checker

Сначала ответьте без подсказки. Затем сравните с короткой моделью.

### Как решить, где должен жить state?

«Я определяю source of truth, нужный lifetime и минимальный круг потребителей.
Server facts держу в query cache, shareable navigation — в URL, вычислимое не
храню, одиночное UI-состояние colocate в компоненте. Поднимаю state только до
ближайшего общего владельца, а reducer использую для сложных переходов».

### Когда Context — неправильный инструмент?

«Когда проблема не в глубокой передаче props, а в ownership, server caching или
derived data. Context лишь доставляет значение. Большой часто меняющийся
provider скрывает зависимости и расширяет rerenders; для локальной ветки props
и composition обычно яснее».

### Чем server state отличается от global client state?

«Server state принадлежит внешней системе: клиент держит потенциально устаревший
cache и управляет loading, error, refetch, mutation. Global client state
принадлежит приложению пользователя. То, что server data читается глобально, не
меняет его владельца».

### Почему synchronized duplicate state опасен?

«Каждая копия создаёт правило синхронизации и новые промежуточные противоречивые
состояния. Например, selected object устаревает после обновления issues. Я храню
ID и получаю объект из актуальной коллекции во время render».

### Когда выбирать reducer вместо нескольких useState?

«Когда несколько полей образуют workflow, actions должны менять их согласованно,
а transitions полезно назвать и тестировать как pure function. Reducer не нужен
для каждого объекта и не должен выполнять side effects».

## Ресурсы

- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
