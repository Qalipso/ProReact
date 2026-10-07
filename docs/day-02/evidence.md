# Evidence

Проверено 6 октября 2026 года локально в учебном проекте.

## Автоматические проверки

| Проверка | Результат |
|---|---|
| `npm test` | 5/5 passed |
| `npm run lint` | passed, без diagnostics |
| `npm run build` | passed, 26 modules transformed |

Тесты подтверждают:

- invalid URL enum безопасно возвращается к default;
- serializer сохраняет чужие query params и убирает default filters;
- visible issues являются pure derivation;
- reducer не пропускает invalid draft на Review;
- reducer переводит valid draft на Review.

## Browser evidence

Проверен запущенный Vite UI:

1. Начальный server query показал 6 issues и счётчики `3 open / 1 in progress /
   2 resolved`.
2. Выбор статуса Open изменил URL на `?status=open` и список на 3 issues.
3. Browser Back вернул URL без query и список из 6 issues.
4. Local selection и reducer draft остались открыты после Back: URL state не
   перехватил ownership selection.
5. Выбор issue открыл editor; `Review changes` перевёл workflow со шага Details
   на Review.
6. Save прошёл через API/cache boundary, показал success и обновил title в
   issue card.
7. Ошибок в browser console не обнаружено.

## Day 1 runtime evidence

Интерактивный `SnapshotLab` проверен в том же UI:

1. **Schedule stale +1** был запущен при `count = 0`.
2. **Add 3** показал `3` до срабатывания timer.
3. Stale callback заменил новое значение на `1`, используя captured snapshot.
4. После reset сценарий **Schedule safe +1 → Add 3** завершился значением `4`:
   functional updater получил актуальное значение.
5. Несохранённый title draft исчез после переключения issue и возврата: новый
   `key` создал новую identity editor.

## Evidence boundary

Проверки доказывают local behavior, pure rules, сборку и работу in-memory API
boundary. Они не доказывают network backend, database persistence, multi-user
cache invalidation или production deployment.
