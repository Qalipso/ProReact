# Единый React-пример: как читать код

Это не набор несвязанных сниппетов. Triage board показывает решения Day 2, а
расположенная под ним runtime-лаборатория позволяет руками воспроизвести Day 1.

## 1. Начните с composition root

`src/App.jsx` только собирает две самостоятельные части:

```jsx
<IssueBoard />
<SnapshotLab />
```

В корне нет state «на всякий случай». Каждый owner находится ближе к своим
потребителям.

## 2. Воспроизведите snapshot и stale closure

Откройте `src/components/SnapshotLab.jsx`.

### Functional update

Нажмите **Add 3**. Один event handler вызывает три updater-функции. React
обрабатывает очередь последовательно, поэтому значение увеличивается на три.
Сам handler продолжает видеть snapshot до клика.

### Stale callback

1. Нажмите **Schedule stale +1** при значении 0.
2. До срабатывания таймера нажмите **Add 3**.
3. Значение сначала станет 3, а затем 1.

Timer сохранил `scheduledFrom = 0` и позже выполнил replacement `0 + 1`.

Теперь повторите последовательность с **Schedule safe +1**. Functional updater
получит актуальное 3, поэтому результатом будет 4.

## 3. Проследите ownership в board

Откройте `src/components/IssueBoard.jsx`.

- URL владеет фильтрами.
- Cache snapshot предоставляет issues.
- `IssueBoard` владеет только `selectedIssueId`, потому что список меняет выбор,
  а editor его читает.
- `visibleIssues`, `counts` и `selectedIssue` вычисляются в render.
- Дети получают данные вниз и сообщают события наверх callbacks.

Context здесь сделал бы ownership менее очевидным, поэтому обычная composition
лучше соответствует размеру дерева.

## 4. Проверьте identity

Карточки получают `key={issue.id}`. Фильтр меняет состав списка, но identity
оставшихся issue не переезжает на другие строки.

Editor получает `key={selectedIssue.id}`. Здесь новый key нужен намеренно:

1. Выберите issue A и измените title, не сохраняя.
2. Выберите issue B.
3. Вернитесь к A.

Предыдущий draft исчез, потому что React размонтировал одну identity editor и
создал другую.

## 5. Пройдите reducer workflow

Откройте `src/components/IssueEditor.jsx` и `src/state.js`.

- Компонент dispatch-ит события.
- Pure reducer вычисляет следующее состояние draft.
- Validation является частью перехода `next`.
- Network side effect остаётся в `submitChanges`, за пределами reducer.
- После успешного API response обновляется server cache.

Так события читаются как история пользователя, а не как случайный набор
`setIsSaving`, `setIsReviewing` и `setHasError`.

## 6. Проверьте URL и server cache

`src/urlFilters.js` подписывает React на `window.location.search`. Select changes
создают history entry, а ввод поиска заменяет текущую запись, чтобы история не
содержала отдельную страницу на каждую букву.

`src/issuesApi.js` — учебный in-memory backend. `src/issuesCache.js` скрывает
loading/error/data metadata и публикует целостный snapshot подписчикам. Реальный
production-проект заменил бы этот слой на HTTP API и готовый query cache.

## 7. Обратите внимание на комментарии

Комментарии в коде написаны по-английски и объясняют решения и риски — почему
state находится здесь, почему используется ID, почему reducer остаётся pure.
Они не пересказывают очевидный синтаксис JavaScript.
