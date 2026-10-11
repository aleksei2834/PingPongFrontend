# Методичка по Storybook

Для: проекта PingPong (React 19 + TypeScript + Vite + FSD). Версия Storybook: **10.x**.

Как читать: разделы 1–2 — понять, что это. Раздел 3 — установка. Разделы 4–6 — три конфига.
Разделы 7–13 — как писать истории (это 90% повседневной работы). Раздел 16 — практика по шагам для нашего проекта.

---

## Содержание

1. [Что такое Storybook и зачем он нужен](#1-что-такое-storybook-и-зачем-он-нужен)
2. [Как он устроен](#2-как-он-устроен)
3. [Установка](#3-установка)
4. [`.storybook/main.ts` — главный конфиг](#4-storybookmaints--главный-конфиг)
5. [`.storybook/preview.tsx` — настройки для всех историй](#5-storybookpreviewtsx--настройки-для-всех-историй)
6. [`.storybook/manager.ts` — внешний вид интерфейса](#6-storybookmanagerts--внешний-вид-интерфейса)
7. [Файл историй: синтаксис CSF3](#7-файл-историй-синтаксис-csf3)
8. [args и argTypes: пропсы и панель Controls](#8-args-и-argtypes-пропсы-и-панель-controls)
9. [parameters: настройки истории](#9-parameters-настройки-истории)
10. [decorators: обёртки](#10-decorators-обёртки)
11. [play: тесты внутри истории](#11-play-тесты-внутри-истории)
12. [Документация: autodocs и MDX](#12-документация-autodocs-и-mdx)
13. [Моки: API, роутер, модули](#13-моки-api-роутер-модули)
14. [Аддоны](#14-аддоны)
15. [Команды](#15-команды)
16. [Практика: настройка Storybook в нашем проекте по шагам](#16-практика-настройка-storybook-в-нашем-проекте-по-шагам)
17. [Правила проекта](#17-правила-проекта)
18. [Частые проблемы](#18-частые-проблемы)
19. [Шпаргалка](#19-шпаргалка)

---

## 1. Что такое Storybook и зачем он нужен

Storybook — это **отдельное приложение-витрина для компонентов**. Оно использует тот же код, что и ваше
приложение, но показывает компоненты **по одному, в изоляции, во всех состояниях**.

```
npm run dev        → приложение       (http://localhost:5173)
npm run storybook  → витрина компонентов (http://localhost:6006)
```

Зачем:

| Проблема без Storybook                                                                                            | Как решает Storybook                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Чтобы увидеть пузырь сообщения в состоянии «ошибка отправки», надо залогиниться, открыть чат, выключить интернет… | Пишете историю `Error` — и видите её сразу              |
| Состояния hover / disabled / loading / длинный текст проверяются «когда-нибудь»                                   | Все состояния на одной странице                         |
| Документация компонентов устаревает                                                                               | Документация генерируется из кода                       |
| Ручная проверка, что кнопка кликается                                                                             | Каждая история — автотест                               |
| Сложно сверить с Figma                                                                                            | Переключаете фон на цвет холста Figma и сравниваете 1:1 |

Подход называется **Component-Driven Development**: сначала маленькие детали (кнопка, аватар) в изоляции,
потом из них собираются блоки (строка чата), потом экраны.

---

## 2. Как он устроен

### 2.1 Две части интерфейса

```
┌───────────────── MANAGER (интерфейс Storybook) ─────────────────┐
│ ┌──────────┐ ┌───────────────────────────────────────────────┐ │
│ │ Меню     │ │ Тулбар: фон · зум · viewport · линейка · a11y │ │
│ │          │ ├───────────────────────────────────────────────┤ │
│ │ shared   │ │ ┌──────────── PREVIEW (iframe) ─────────────┐ │ │
│ │  Button  │ │ │                                           │ │ │
│ │   Docs   │ │ │   здесь рисуется ВАШ компонент            │ │ │
│ │   Large  │ │ │   с ВАШИМИ стилями                        │ │ │
│ │          │ │ └───────────────────────────────────────────┘ │ │
│ │          │ ├───────────────────────────────────────────────┤ │
│ │          │ │ Controls │ Actions │ Interactions │ A11y      │ │
│ └──────────┘ └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Manager** — само приложение Storybook (меню, тулбар, панели). Настраивается в `manager.ts`.
- **Preview** — iframe, в котором рисуется компонент. Настраивается в `preview.tsx`.
  Ваши глобальные стили подключаются **только сюда** — поэтому они не ломают интерфейс Storybook.

### 2.2 Файлы

```
.storybook/                  ← НАСТРОЙКИ (трогаете редко)
├── main.ts                  ← где истории, аддоны, сборщик. Работает в Node.js. После правки — перезапуск
├── preview.tsx              ← что применить ко ВСЕМ историям. Работает в браузере
└── manager.ts               ← тема и вид интерфейса. Необязательный

src/                         ← ИСТОРИИ (пишете постоянно), рядом с компонентами
└── shared/ui/button/
    ├── Button.tsx
    ├── Button.module.css
    └── Button.stories.tsx   ← истории кнопки
```

### 2.3 Словарь

| Термин              | Что это                                                     | Пример                                           |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| **Story (история)** | компонент в одном конкретном состоянии                      | `Disabled`, `Loading`, `WithLongName`            |
| **CSF**             | Component Story Format — формат файла историй (сейчас CSF3) | `export default meta; export const Primary = {}` |
| **meta**            | описание компонента: одно на файл, `export default`         | `{ title, component, args }`                     |
| **args**            | пропсы истории                                              | `{ disabled: true }`                             |
| **argTypes**        | описание пропсов: какой контрол, какие варианты             | `{ variant: { control: 'select' } }`             |
| **parameters**      | статические настройки истории для Storybook/аддонов         | `{ layout: 'fullscreen' }`                       |
| **decorators**      | обёртки вокруг истории                                      | роутер, провайдер, контейнер с отступами         |
| **play**            | функция-тест, выполняется после отрисовки                   | кликнуть и проверить                             |
| **globals**         | глобальные переключатели тулбара                            | выбранный фон, язык, тема                        |
| **tags**            | метки истории                                               | `'autodocs'`, `'!test'`                          |
| **addon**           | плагин, добавляющий возможности                             | a11y, docs, vitest                               |

### 2.4 Наследование настроек

Почти всё (`args`, `parameters`, `decorators`, `argTypes`, `tags`, `loaders`) задаётся на **трёх уровнях**:

```
preview.tsx  (глобально — для всех историй)
     ↓
meta         (для всех историй одного файла)
     ↓
история      (для одной истории)
```

Нижний уровень **перекрывает** верхний (для объектов — сливается по ключам).
Пример: в `preview.tsx` `layout: 'centered'`, а в истории виджета `parameters: { layout: 'fullscreen' }` —
у этой истории будет fullscreen, у всех остальных — centered.

---

## 3. Установка

### 3.1 Через мастер (рекомендуется)

```bash
npm create storybook@latest
```

Что произойдёт:

1. Мастер определит, что у вас **React + Vite**.
2. Спросит, что ставить. Варианты:
   - **Recommended** — Storybook + документация + тесты (Vitest + Playwright) + a11y. **Выбирайте этот.**
   - **Minimal** — только витрина, без тестов и документации.
3. Установит пакеты:
   | Пакет                                                                       | Зачем                                                                             |
   | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
   | `storybook`                                                                 | ядро (в нём же встроены controls, actions, backgrounds, viewport, toolbars, test) |
   | `@storybook/react-vite`                                                     | связка «React + Vite»                                                             |
   | `@storybook/addon-docs`                                                     | автодокументация и MDX                                                            |
   | `@storybook/addon-a11y`                                                     | проверка доступности                                                              |
   | `@storybook/addon-vitest`                                                   | истории как тесты                                                                 |
   | `@chromatic-com/storybook`                                                  | визуальные тесты через облако Chromatic (необязательный)                          |
   | `eslint-plugin-storybook`                                                   | правила ESLint для файлов историй                                                 |
   | `vitest`, `@vitest/browser-playwright`, `playwright`, `@vitest/coverage-v8` | запуск тестов в браузере                                                          |
4. Создаст `.storybook/main.ts` и `.storybook/preview.ts`.
5. Добавит в `package.json` скрипты `storybook` и `build-storybook`.
6. Изменит `vite.config.ts` (добавит блок `test` для запуска историй как тестов) и создаст `vitest.shims.d.ts`.
7. Создаст папку **`src/stories/`** с примерами (Button, Header, Page).
8. Предложит скачать браузер для тестов (Playwright Chromium) — соглашайтесь.

**После установки сразу:**

```bash
rm -rf src/stories             # примеры не нужны, они ещё и нарушают нашу FSD-структуру
git mv .storybook/preview.ts .storybook/preview.tsx   # .tsx — чтобы можно было писать JSX в декораторах
npm run storybook              # проверить, что открывается
```

Посмотрите `git diff` — всегда полезно увидеть, что мастер поменял в ваших файлах
(`vite.config.ts`, `eslint.config.ts`, `package.json`, `.gitignore`).

### 3.2 Вручную (если мастер не подходит)

```bash
npm i -D storybook @storybook/react-vite @storybook/addon-docs @storybook/addon-a11y
```

И создать `.storybook/main.ts` и `.storybook/preview.tsx` самостоятельно (разделы 4–5),
добавить скрипты:

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

### 3.3 Особенности Windows (проверено на этом проекте)

При запуске историй как тестов (`vitest`) на этой машине были две проблемы:

1. **`ERR_CONNECTION_REFUSED`** — сервер тестов слушает `localhost` по IPv6, а браузер идёт по IPv4.
   Решение — в `vite.config.ts`, в блоке `test.projects[…].test.browser` добавить:
   ```ts
   api: { host: '127.0.0.1' },
   ```
2. **«Browser connection was closed while running tests»** через ~4 секунды — падает облегчённый
   `chrome-headless-shell` от Playwright. Решение — запускать тесты в системном Microsoft Edge на Windows:
   ```ts
   // наверху vite.config.ts
   const browserChannel = process.platform === 'win32' ? 'msedge' : undefined;

   // в блоке browser
   provider: playwright({ launchOptions: { channel: browserChannel } }),
   ```
   На Linux/Mac (и в CI) `channel` будет `undefined` → обычный Chromium.

---

## 4. `.storybook/main.ts` — главный конфиг

Работает в **Node.js** при старте. Отвечает на вопросы: **где** истории, **какие** аддоны, **чем** собирать.
⚠️ После любого изменения — **перезапустить** `npm run storybook`.

### 4.1 Полный пример с объяснениями

```ts
// Тип — для подсказок и проверки TypeScript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // ГДЕ искать истории. Пути — относительно папки .storybook
  stories: [
    '../src/**/*.mdx', // страницы документации
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', // истории компонентов
  ],

  // КАКИЕ аддоны подключить (порядок = порядок вкладок в панели)
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@chromatic-com/storybook',
  ],

  // ЧЕМ собирать: React + Vite. Storybook подхватит ваш vite.config.ts (алиасы @/, svgr и т.д.)
  framework: '@storybook/react-vite',

  // Папки со статикой: файлы из /public доступны в историях по пути /имя-файла
  staticDirs: ['../public'],
};

export default config;
```

### 4.2 Все полезные поля

| Поле                     | Что делает                               | Пример                                                                                       |
| ------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `stories`                | маски файлов историй                     | см. выше                                                                                     |
| `addons`                 | список аддонов                           | см. раздел 14                                                                                |
| `framework`              | фреймворк + сборщик                      | `'@storybook/react-vite'`                                                                    |
| `staticDirs`             | папки со статикой                        | `['../public']` или `[{ from: '../src/shared/assets', to: '/assets' }]`                      |
| `docs.defaultName`       | как называется страница автодоков в меню | `{ defaultName: 'Документация' }`                                                            |
| `typescript.reactDocgen` | чем читать пропсы для таблицы в Docs     | `'react-docgen-typescript'` — точнее, но медленнее; `'react-docgen'` — по умолчанию, быстрее |
| `viteFinal`              | донастроить Vite только для Storybook    | см. ниже                                                                                     |
| `core.disableTelemetry`  | не отправлять анонимную статистику       | `{ disableTelemetry: true }`                                                                 |

### 4.3 Формат `stories` в виде объекта

Можно задать префикс в меню для целой папки:

```ts
stories: [
  { directory: '../src/shared', files: '**/*.stories.tsx', titlePrefix: 'shared' },
],
```

### 4.4 `viteFinal` — если Storybook нужно собрать иначе, чем приложение

```ts
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  // …
  async viteFinal(config) {
    return mergeConfig(config, {
      define: { 'import.meta.env.VITE_API_URL': JSON.stringify('http://mock') },
    });
  },
};
```

Обычно не нужен: Storybook и так берёт ваш `vite.config.ts`.

---

## 5. `.storybook/preview.tsx` — настройки для всех историй

Работает **в браузере**, внутри iframe. Всё, что здесь, применяется **ко всем историям**:
глобальные стили, параметры, декораторы, глобальные переключатели.

### 5.1 Базовый пример для нашего проекта

```tsx
import type { Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';

// 1. Глобальные стили приложения: шрифты + токены + reset.
//    Без этого компоненты будут Times New Roman, а var(--color-…) — пустыми.
import '../src/shared/styles/index.css';

const preview: Preview = {
  parameters: {
    // 2. Раскладка по умолчанию: по центру
    layout: 'centered',

    // 3. Фоны для переключателя в тулбаре
    backgrounds: {
      options: {
        app: { name: 'App (black)', value: '#000000' },
        canvas: { name: 'Figma canvas', value: '#444444' },
        light: { name: 'Light', value: '#ffffff' },
      },
    },

    // 4. Автоподбор контролов по имени пропса
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // 5. Тёмная тема страниц документации
    docs: { theme: themes.dark },

    // 6. Доступность: 'todo' — показывать, 'error' — ронять тесты, 'off' — выключить
    a11y: { test: 'todo' },
  },

  // 7. Начальные значения переключателей тулбара
  initialGlobals: {
    backgrounds: { value: 'app' },
  },
};

export default preview;
```

### 5.2 Что ещё можно задать в `preview`

| Поле             | Что делает                                                 | Раздел |
| ---------------- | ---------------------------------------------------------- | ------ |
| `parameters`     | настройки по умолчанию для всех историй                    | 9      |
| `decorators`     | обёртки для всех историй (роутер, провайдеры)              | 10     |
| `initialGlobals` | стартовые значения тулбара                                 | ниже   |
| `globalTypes`    | свои переключатели в тулбаре                               | ниже   |
| `argTypes`       | общие описания пропсов                                     | 8      |
| `args`           | общие пропсы                                               | 8      |
| `loaders`        | асинхронная загрузка данных перед историей (например, MSW) | 13     |
| `beforeEach`     | код перед каждой историей (сброс моков, localStorage)      | ниже   |
| `tags`           | теги для всех историй                                      | 12     |

### 5.3 Свой переключатель в тулбаре (globalTypes)

Пример — переключатель языка:

```tsx
const preview: Preview = {
  // описание переключателя
  globalTypes: {
    locale: {
      description: 'Язык интерфейса',
      toolbar: {
        icon: 'globe', // иконка в тулбаре
        items: [
          { value: 'ru', title: 'Русский' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true, // показывать выбранное значение на кнопке
      },
    },
  },
  // значение по умолчанию
  initialGlobals: { locale: 'ru' },
  // использовать значение — в декораторе
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale; // 'ru' | 'en'
      return <Story />; // тут оборачиваем в i18n-провайдер с этим locale
    },
  ],
};
```

### 5.4 `beforeEach` — подготовка перед каждой историей

```tsx
const preview: Preview = {
  async beforeEach() {
    localStorage.clear(); // каждая история стартует с чистого состояния
    return () => {
      // необязательная функция очистки после истории
      // …
    };
  },
};
```

---

## 6. `.storybook/manager.ts` — внешний вид интерфейса

Необязательный файл. Влияет только на сам Storybook (меню, панели), **не** на компоненты.

### 6.1 Готовая тёмная тема

```ts
import { addons } from 'storybook/manager-api';
import { themes } from 'storybook/theming';

addons.setConfig({
  theme: themes.dark,
});
```

### 6.2 Своя тема с логотипом и цветами

```ts
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const theme = create({
  base: 'dark', // от какой темы отталкиваться
  brandTitle: 'PingPong UI', // заголовок вместо логотипа Storybook
  brandImage: '/favicon.svg', // логотип (из staticDirs)
  brandUrl: '/',
  colorPrimary: '#1274ff',
  colorSecondary: '#1274ff', // выделенный пункт меню
  appBg: '#0b0b0b', // фон меню
  appContentBg: '#000000',
  fontBase: '"Inter", sans-serif',
});

addons.setConfig({
  theme,
  panelPosition: 'bottom', // панели снизу ('right' — справа)
  showToolbar: true,
  sidebar: { showRoots: true }, // верхний уровень меню (shared/entities/…) — заголовками
});
```

---

## 7. Файл историй: синтаксис CSF3

### 7.1 Минимальный файл

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'shared/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Log In' },
};
```

Разбор:

- `import type { Meta, StoryObj }` — типы. `Meta` описывает компонент, `StoryObj` — одну историю.
- `const meta = {…} satisfies Meta<typeof Button>` — `satisfies` проверяет тип, **но сохраняет точные типы**
  ваших `args` (лучше подсказки, чем `const meta: Meta<…> = …`).
- `export default meta` — **обязательно**. Без него Storybook не увидит файл.
- `type Story = StoryObj<typeof meta>` — тип для историй, чтобы не писать длинно каждый раз.
- **Каждый именованный `export` — отдельная история.** Имя превращается в название:
  `Primary` → «Primary», `WithLongText` → «With Long Text».

### 7.2 Все поля `meta`

```tsx
const meta = {
  title: 'shared/Button',          // путь в меню. Можно не указывать — тогда возьмётся из пути файла
  component: Button,               // компонент: для таблицы пропсов и Controls
  subcomponents: { Icon },         // связанные компоненты — их пропсы тоже будут в Docs
  tags: ['autodocs'],              // метки (раздел 12)
  args: { children: 'Log In' },    // пропсы по умолчанию для всех историй файла
  argTypes: { … },                 // описание пропсов (раздел 8)
  parameters: { … },               // настройки (раздел 9)
  decorators: [ … ],               // обёртки (раздел 10)
  loaders: [ … ],                  // асинхронные загрузчики
  render: (args) => <Button {...args} />,  // как рисовать (по умолчанию — <component {...args} />)
  beforeEach: async () => { … },   // код перед каждой историей файла
  excludeStories: /.*Data$/,       // какие export НЕ считать историями (например, моковые данные)
} satisfies Meta<typeof Button>;
```

### 7.3 Все поля истории

```tsx
export const Disabled: Story = {
  name: 'Заблокированная',         // название в меню (по умолчанию — из имени export)
  args: { disabled: true },        // пропсы (сливаются с meta.args)
  argTypes: { … },
  parameters: { … },
  decorators: [ … ],
  globals: { backgrounds: { value: 'light' } },  // зафиксировать переключатель тулбара для этой истории
  tags: ['!test'],                 // убрать из тестов
  render: (args) => <…/>,          // своя отрисовка
  play: async ({ canvas, userEvent }) => { … },  // тест (раздел 11)
};
```

### 7.4 `render` — когда нужна своя отрисовка

По умолчанию история рисует `<component {...args} />`. Свой `render` нужен, когда:

**Несколько компонентов в одной истории** (например, все размеры рядом):

```tsx
export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar {...args} size={32} />
      <Avatar {...args} size={48} />
      <Avatar {...args} size={88} />
    </div>
  ),
};
```

**Компонент, которому нужны дети:**

```tsx
export const InList: Story = {
  render: (args) => (
    <ul>
      <ListItem {...args} title="Sydney Sweeney" />
      <ListItem {...args} title="Poni kakata" />
    </ul>
  ),
};
```

**Управляемый компонент (нужно состояние)** — через `useArgs`:

```tsx
import { useArgs } from 'storybook/preview-api';

export const Controlled: Story = {
  args: { value: '' },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs();
    return (
      <Input {...args} value={value} onChange={(e) => updateArgs({ value: e.target.value })} />
    );
  },
};
```

`useArgs` связывает состояние с панелью Controls: печатаете в поле — значение меняется и в Controls.

### 7.5 Переиспользование историй

```tsx
export const Primary: Story = {
  args: { variant: 'primary', children: 'Log In' },
};

// берём всё из Primary и меняем одно поле
export const PrimaryDisabled: Story = {
  ...Primary,
  args: { ...Primary.args, disabled: true },
};
```

### 7.6 Моковые данные в файле историй

```tsx
// не история — исключена через excludeStories в meta
export const userData = { id: '1', username: 'Sydney Sweeney', status: 'online' };

const meta = {
  // …
  excludeStories: /.*Data$/,
} satisfies Meta<typeof UserRow>;
```

Лучше — выносить моки в отдельный файл (`entities/user/model/mocks.ts`) и импортировать.

---

## 8. args и argTypes: пропсы и панель Controls

### 8.1 args

`args` — это пропсы. Задаются на трёх уровнях и сливаются:

```tsx
// preview.tsx — для всех
args: { },

// meta — для файла
args: { children: 'Log In', onClick: fn() },

// история — для одной
args: { disabled: true },
// итог для этой истории: { children: 'Log In', onClick: fn(), disabled: true }
```

Значения `args` можно менять мышкой в панели **Controls** — компонент перерисуется.

### 8.2 argTypes — как показывать пропсы

Storybook сам читает типы пропсов из TypeScript и подбирает контролы.
`argTypes` нужен, чтобы **уточнить** или **переопределить**.

```tsx
argTypes: {
  variant: {
    control: 'select',                           // тип контрола
    options: ['primary', 'outline', 'text'],     // варианты
    description: 'Внешний вид кнопки',           // описание в таблице Docs
    table: {
      category: 'Внешний вид',                   // группировка в таблице
      defaultValue: { summary: 'primary' },      // что показать как значение по умолчанию
      type: { summary: "'primary' | 'outline' | 'text'" },
    },
  },
  size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
  disabled: { control: 'boolean' },
  onClick: { table: { disable: true } },         // спрятать из таблицы и Controls
  className: { control: false },                 // показать в таблице, но без контрола
},
```

### 8.3 Типы контролов

| `control`                                      | Вид                    | Для чего                    |
| ---------------------------------------------- | ---------------------- | --------------------------- |
| `'text'`                                       | поле ввода             | строки                      |
| `'boolean'`                                    | переключатель          | `true/false`                |
| `'number'`                                     | числовое поле          | числа                       |
| `{ type: 'range', min: 0, max: 100, step: 1 }` | ползунок               | числа в диапазоне           |
| `'color'`                                      | палитра                | цвета                       |
| `'date'`                                       | календарь              | даты                        |
| `'select'`                                     | выпадающий список      | один из многих вариантов    |
| `'radio'` / `'inline-radio'`                   | радиокнопки            | один из 2–4 вариантов       |
| `'check'` / `'inline-check'`                   | чекбоксы               | несколько из вариантов      |
| `'multi-select'`                               | список с мультивыбором | несколько из многих         |
| `'object'`                                     | JSON-редактор          | объекты, массивы            |
| `'file'`                                       | выбор файла            | загрузка (`accept: '.png'`) |
| `false`                                        | без контрола           | функции, сложные пропсы     |

### 8.4 `mapping` — когда пропс нельзя выбрать из списка напрямую

Например, пропс `icon: ReactNode`:

```tsx
argTypes: {
  icon: {
    control: 'select',
    options: ['none', 'search', 'plus'],          // что видно в списке
    mapping: {                                    // что реально передаётся в пропс
      none: undefined,
      search: <Icon name="search" />,
      plus: <Icon name="plus" />,
    },
  },
},
```

### 8.5 Условные контролы

Показать контрол, только если выполнено условие:

```tsx
argTypes: {
  iconRight: { if: { arg: 'variant', eq: 'password' } },  // только для variant=password
  loadingText: { if: { arg: 'loading' } },                // только если loading=true
},
```

### 8.6 Настройки панели Controls

```tsx
parameters: {
  controls: {
    expanded: true,                       // показывать описания и значения по умолчанию
    sort: 'requiredFirst',                // 'alpha' | 'requiredFirst' | 'none'
    include: ['variant', 'size'],         // показывать только эти
    exclude: ['className', 'style'],      // или скрыть эти (можно regex: /^on.*/)
  },
},
```

### 8.7 Actions — логирование событий

Чтобы видеть вызовы колбэков в панели **Actions** и проверять их в тестах, передайте шпиона `fn()`:

```tsx
import { fn } from 'storybook/test';

const meta = {
  args: {
    onClick: fn(),
    onChange: fn(),
  },
} satisfies Meta<typeof Input>;
```

---

## 9. parameters: настройки истории

`parameters` — статические настройки для Storybook и аддонов. Задаются в `preview` / `meta` / истории.

### 9.1 Самые нужные

```tsx
parameters: {
  // Раскладка: 'centered' | 'fullscreen' | 'padded'
  layout: 'fullscreen',

  // Фоны (раздел 9.2)
  backgrounds: { … },

  // Viewport — размеры экрана (раздел 9.3)
  viewport: { … },

  // Controls (раздел 8.6)
  controls: { … },

  // Документация (раздел 12)
  docs: {
    description: { story: 'Кнопка в состоянии загрузки — показывает спиннер вместо текста.' },
    source: { type: 'code' },           // какой код показывать в Docs
  },

  // Доступность
  a11y: {
    test: 'error',                       // 'todo' | 'error' | 'off'
    config: {
      rules: [{ id: 'color-contrast', enabled: false }],  // выключить конкретное правило
    },
  },

  // Моки API (раздел 13)
  msw: { handlers: [ … ] },
},
```

### 9.2 Фоны (backgrounds)

```tsx
// preview.tsx — список фонов
parameters: {
  backgrounds: {
    options: {
      app: { name: 'App', value: '#000' },
      light: { name: 'Light', value: '#fff' },
    },
  },
},
initialGlobals: {
  backgrounds: { value: 'app' },           // фон по умолчанию
},
```

```tsx
// в истории — зафиксировать фон
export const OnLight: Story = {
  globals: { backgrounds: { value: 'light' } },
};

// в истории — убрать переключатель фона
parameters: { backgrounds: { disable: true } },
```

### 9.3 Viewport — размеры экрана

```tsx
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

// preview.tsx
parameters: {
  viewport: {
    options: {
      ...INITIAL_VIEWPORTS,                                   // готовые: iPhone, iPad…
      desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' } },
      laptop: { name: 'Laptop 1280', styles: { width: '1280px', height: '800px' } },
    },
  },
},
```

```tsx
// в истории — открыть сразу в нужном размере
export const Mobile: Story = {
  globals: { viewport: { value: 'iphone14', isRotated: false } },
};
```

---

## 10. decorators: обёртки

Декоратор — функция, которая **оборачивает** историю. Синтаксис:

```tsx
(Story, context) => (
  <Обёртка>
    <Story />
  </Обёртка>
);
```

- `Story` — сама история как компонент.
- `context` — всё о текущей истории: `args`, `globals`, `parameters`, `viewMode`, `title`, `name`.

### 10.1 Примеры

**Отступы и ширина** (например, строка списка должна быть шириной как панель):

```tsx
const meta = {
  decorators: [
    (Story) => (
      <div style={{ width: 185, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatListItem>;
```

**Роутер** — для компонентов с `<Link>` / `useNavigate`:

```tsx
import { MemoryRouter } from 'react-router';

decorators: [
  (Story) => (
    <MemoryRouter initialEntries={['/messages/1']}>
      <Story />
    </MemoryRouter>
  ),
],
```

**React Query** — для виджетов с запросами:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

decorators: [
  (Story) => {
    // новый клиент на каждую историю — чтобы кэш не переезжал между историями
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <QueryClientProvider client={client}>
        <Story />
      </QueryClientProvider>
    );
  },
],
```

**Использование параметров истории в декораторе** (например, начальный URL):

```tsx
// preview.tsx
decorators: [
  (Story, { parameters }) => (
    <MemoryRouter initialEntries={[parameters.route ?? '/']}>
      <Story />
    </MemoryRouter>
  ),
],

// в истории
parameters: { route: '/friends' },
```

### 10.2 Порядок

Декораторы применяются **изнутри наружу**: декоратор истории — ближе всего к компоненту,
потом декораторы `meta`, потом `preview`. Поэтому провайдеры (роутер, Query) держите в `preview` —
они окажутся снаружи всех остальных обёрток.

---

## 11. play: тесты внутри истории

`play` — асинхронная функция, которая выполняется **после отрисовки** истории.
В ней можно кликать, вводить текст и проверять результат.
Видно во вкладке **Interactions** (пошагово) и запускается в `vitest`.

### 11.1 Синтаксис

```tsx
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';

export const SubmitsForm: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvas, userEvent, args, step, canvasElement }) => {
    // canvas — поиск элементов внутри истории
    // userEvent — действия пользователя
    // args — пропсы истории (в т.ч. шпионы fn())
    // step — группировка шагов в Interactions
    // canvasElement — корневой DOM-элемент истории

    await step('Ввод email', async () => {
      await userEvent.type(canvas.getByPlaceholderText('Email'), 'test@mail.com');
    });

    await step('Отправка', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Log In' }));
    });

    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
```

### 11.2 Поиск элементов (как в Testing Library)

| Метод                      | Когда                                   | Если не найден     |
| -------------------------- | --------------------------------------- | ------------------ |
| `getBy…`                   | элемент точно есть                      | ошибка             |
| `queryBy…`                 | проверить, что элемента **нет**         | `null`             |
| `findBy…`                  | элемент появится **позже** (асинхронно) | ждёт, потом ошибка |
| `getAllBy…` / `findAllBy…` | несколько элементов                     | массив             |

Приоритет запросов (от лучшего к худшему):

1. `getByRole('button', { name: 'Log In' })` — **по роли и доступному имени** (как видит скринридер). Лучший.
2. `getByLabelText('Email')` — поля форм по `<label>`.
3. `getByPlaceholderText('Search')`.
4. `getByText('Sydney Sweeney')`.
5. `getByTestId('chat-item')` — крайний случай (нужен `data-testid`).

Если `getByRole` не находит кнопку-иконку — у неё нет `aria-label`. Это заодно и ошибка доступности.

### 11.3 Действия (userEvent)

```tsx
await userEvent.click(el);
await userEvent.dblClick(el);
await userEvent.hover(el); // проверить тултип
await userEvent.unhover(el);
await userEvent.type(input, 'Привет'); // напечатать
await userEvent.clear(input);
await userEvent.keyboard('{Enter}'); // нажать клавишу
await userEvent.keyboard('{Shift>}{Enter}{/Shift}'); // Shift+Enter
await userEvent.tab(); // Tab — проверить фокус
await userEvent.selectOptions(select, 'ru');
await userEvent.upload(fileInput, new File(['x'], 'avatar.png', { type: 'image/png' }));
```

### 11.4 Проверки (expect)

```tsx
await expect(el).toBeInTheDocument();
await expect(el).toBeVisible();
await expect(el).toBeDisabled();
await expect(el).toHaveFocus();
await expect(el).toHaveTextContent('17:59');
await expect(el).toHaveAttribute('aria-pressed', 'true');
await expect(el).toHaveClass('active');
await expect(input).toHaveValue('test@mail.com');
await expect(args.onClick).toHaveBeenCalled();
await expect(args.onClick).toHaveBeenCalledOnce();
await expect(args.onChange).toHaveBeenCalledWith('Привет');
await expect(args.onClick).not.toHaveBeenCalled();
```

Всегда пишите `await` перед `expect` и `userEvent` — так шаги корректно отображаются в Interactions.

### 11.5 Элементы вне истории (тултипы, модалки, выпадашки через портал)

Порталы рендерятся в `document.body`, а не внутрь истории — `canvas` их не найдёт:

```tsx
play: async ({ canvas, canvasElement, userEvent }) => {
  await userEvent.hover(canvas.getByRole('button', { name: 'Chat' }));
  const body = within(canvasElement.ownerDocument.body);   // искать во всём документе
  await expect(await body.findByRole('tooltip')).toHaveTextContent('Chat');
},
```

### 11.6 Ожидание (waitFor)

```tsx
await waitFor(() => expect(args.onSearch).toHaveBeenCalledWith('Syd')); // например, после debounce
```

### 11.7 Как запускать тесты

| Где          | Как                                                                               |
| ------------ | --------------------------------------------------------------------------------- |
| В интерфейсе | внизу меню — виджет **Testing** → «Run tests» (нужен addon-vitest)                |
| Одна история | открыть → вкладка **Interactions** (play выполняется при каждом открытии)         |
| В терминале  | `npx vitest --project=storybook` (один раз: `npx vitest run --project=storybook`) |

Тестом считается **каждая** история: даже без `play` проверяется, что она отрисовалась без ошибок.
Если включено `a11y.test: 'error'` — ещё и что нет нарушений доступности.

Исключить историю из тестов: `tags: ['!test']`.

---

## 12. Документация: autodocs и MDX

### 12.1 Автодокументация

Добавьте тег — и у компонента появится страница **Docs**: описание, все истории, таблица пропсов.

```tsx
const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;
```

Чтобы включить для всех компонентов сразу — в `preview.tsx`: `tags: ['autodocs']`.

**Описания берутся из JSDoc-комментариев** в коде компонента:

```tsx
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Внешний вид кнопки */
  variant?: 'primary' | 'outline' | 'text';
  /** Показывает спиннер и блокирует кнопку */
  loading?: boolean;
};

/**
 * Основная кнопка приложения. Используется для Log In, Add friend, Edit profile.
 */
export function Button(props: ButtonProps) { … }
```

### 12.2 Теги

| Тег                     | Что делает                                       |
| ----------------------- | ------------------------------------------------ |
| `'autodocs'`            | создать страницу Docs                            |
| `'!autodocs'`           | не показывать историю на странице Docs           |
| `'!dev'`                | скрыть из меню (но история есть в Docs и тестах) |
| `'!test'`               | не запускать как тест                            |
| свои (`'experimental'`) | для фильтрации в меню                            |

### 12.3 MDX — свои страницы документации

MDX = Markdown + JSX. Файл `*.mdx` подхватывается по маске из `main.ts`.

**Отдельная страница** (например, токены дизайна):

```mdx
import { Meta, ColorPalette, ColorItem, Typeset } from '@storybook/addon-docs/blocks';

<Meta title="shared/Tokens" />

# Design Tokens

<ColorPalette>
  <ColorItem
    title="Акцент"
    subtitle="--color-accent-*"
    colors={{ default: 'var(--color-accent)', hover: 'var(--color-accent-hover)' }}
  />
</ColorPalette>

<Typeset fontFamily="Inter" fontSizes={[12, 14, 16]} fontWeight={500} sampleText="Sydney Sweeney" />
```

**Страница, привязанная к компоненту** (заменяет автодоки):

```mdx
import { Meta, Canvas, Controls, Story } from '@storybook/addon-docs/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

Когда использовать: …

<Canvas of={ButtonStories.Primary} /> {/* история + код */}
<Controls of={ButtonStories.Primary} /> {/* таблица пропсов с контролами */}

## Disabled

<Story of={ButtonStories.Disabled} /> {/* только история */}
```

### 12.4 Блоки документации

Импорт из `'@storybook/addon-docs/blocks'`.

| Блок                               | Что рисует                                             |
| ---------------------------------- | ------------------------------------------------------ |
| `Meta`                             | регистрирует страницу (`title="…"` или `of={Stories}`) |
| `Title`, `Subtitle`, `Description` | заголовки и описание компонента                        |
| `Primary`                          | первую историю                                         |
| `Stories`                          | все истории                                            |
| `Canvas`                           | историю + кнопку «Show code»                           |
| `Story`                            | только историю                                         |
| `Controls`                         | таблицу пропсов с контролами                           |
| `ArgTypes`                         | таблицу пропсов без контролов                          |
| `Source`                           | блок кода                                              |
| `ColorPalette`, `ColorItem`        | палитру цветов                                         |
| `Typeset`                          | образцы шрифта                                         |
| `IconGallery`, `IconItem`          | галерею иконок                                         |

---

## 13. Моки: API, роутер, модули

### 13.1 MSW — подмена ответов сервера

Нужен для виджетов, которые сами делают запросы (список чатов, сообщения).
Позволяет сделать истории `Loading`, `Empty`, `Error` без настоящего бэкенда.

**Установка:**

```bash
npm i -D msw msw-storybook-addon
npx msw init public/        # создаст public/mockServiceWorker.js
```

В `main.ts` должно быть `staticDirs: ['../public']`.

**`preview.tsx`:**

```tsx
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize(); // запустить MSW

const preview: Preview = {
  loaders: [mswLoader], // применять хендлеры из parameters.msw перед каждой историей
};
```

**В истории:**

```tsx
import { http, HttpResponse, delay } from 'msw';

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chats', () => HttpResponse.json([{ id: '1', title: 'Sydney Sweeney' }])),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chats', async () => {
          await delay('infinite');
        }),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: { handlers: [http.get('*/api/chats', () => HttpResponse.json([]))] },
  },
};

export const ServerError: Story = {
  parameters: {
    msw: { handlers: [http.get('*/api/chats', () => new HttpResponse(null, { status: 500 }))] },
  },
};
```

`*/api/chats` — звёздочка = любой домен, чтобы не зависеть от `VITE_API_URL`.

### 13.2 Роутер

Через декоратор с `MemoryRouter` (раздел 10.1). Начальный адрес — через `parameters.route`.

### 13.3 Подмена модулей (`sb.mock`)

Если компонент импортирует модуль, который в Storybook не должен работать по-настоящему
(например, сессию из localStorage):

```tsx
// preview.tsx
import { sb } from 'storybook/test';

sb.mock(import('../src/entities/session/model/session.ts')); // заменить на автомок
```

Применяйте точечно — чаще всего хватает пропсов, MSW и декораторов.

---

## 14. Аддоны

### 14.1 Что уже встроено в ядро `storybook` (ставить не надо)

| Возможность         | Где в интерфейсе                                   |
| ------------------- | -------------------------------------------------- |
| Controls            | панель Controls                                    |
| Actions             | панель Actions                                     |
| Backgrounds         | тулбар → фон                                       |
| Viewport            | тулбар → размер экрана                             |
| Toolbars / globals  | тулбар (свои переключатели)                        |
| Measure             | тулбар → линейка (размеры и отступы при наведении) |
| Outline             | тулбар → контуры всех элементов (видно, где что)   |
| Interactions / test | панель Interactions, `storybook/test`              |

### 14.2 Отдельные аддоны

| Аддон                      | Зачем                                       |
| -------------------------- | ------------------------------------------- |
| `@storybook/addon-docs`    | Docs-страницы и MDX                         |
| `@storybook/addon-a11y`    | вкладка Accessibility                       |
| `@storybook/addon-vitest`  | истории как тесты, виджет Testing           |
| `@chromatic-com/storybook` | визуальные тесты в облаке Chromatic         |
| `msw-storybook-addon`      | моки API                                    |
| `@storybook/addon-designs` | встроить фрейм Figma прямо в панель истории |

### 14.3 Как добавить аддон

```bash
npx storybook add @storybook/addon-designs
```

Команда сама установит пакет и впишет его в `addons` в `main.ts`. Потом — перезапуск.

Пример с Figma (очень удобно для сверки):

```tsx
export const Primary: Story = {
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/file/…?node-id=…' },
  },
};
```

---

## 15. Команды

| Команда                                                   | Что делает                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| `npm run storybook`                                       | dev-сервер на :6006, изменения историй подхватываются сразу |
| `npm run storybook -- --no-open`                          | без автооткрытия браузера                                   |
| `npm run storybook -- -p 7007`                            | на другом порту                                             |
| `npm run build-storybook`                                 | собрать статический сайт в `storybook-static/` (для деплоя) |
| `npx vitest run --project=storybook`                      | прогнать все истории как тесты один раз                     |
| `npx vitest --project=storybook`                          | то же, с перезапуском при изменениях                        |
| `npx vitest run --project=storybook src/shared/ui/button` | тесты одного компонента                                     |
| `npx storybook add <аддон>`                               | добавить аддон                                              |
| `npx storybook upgrade`                                   | обновить Storybook и все его пакеты до последней версии     |

Добавьте `storybook-static` в `.gitignore` — собранный сайт в git не нужен.

---

## 16. Практика: настройка Storybook в нашем проекте по шагам

Делайте по порядку, после каждого шага — проверка.

### Шаг 1. Ветка и установка

```bash
git checkout -b chore/storybook
npm create storybook@latest      # выбрать Recommended
rm -rf src/stories
git mv .storybook/preview.ts .storybook/preview.tsx
```

✅ `npm run storybook` открывается (пустое меню — нормально).

### Шаг 2. `main.ts`

- Проверьте маски `stories` (`../src/**/*.mdx` и `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`).
- Добавьте `staticDirs: ['../public']`.
- Перезапустите.

### Шаг 3. `tsconfig.app.json`

Добавьте `.storybook` в `include`, иначе редактор подчеркнёт `import '…css'` в `preview.tsx`:

```json
"include": ["src", ".storybook"]
```

✅ `npx tsc -b` без ошибок.

### Шаг 4. `preview.tsx`

Сделайте по образцу из раздела 5.1: импорт `../src/shared/styles/index.css`, фоны, `layout`, `docs.theme`, `a11y`, `initialGlobals`.

### Шаг 5. `manager.ts`

Создайте по разделу 6.1 (тёмная тема). Попробуйте свою тему из 6.2 с логотипом.

### Шаг 6. Страница токенов

Создайте `src/shared/styles/Tokens.mdx` по разделу 12.3: все группы цветов из `tokens.css` и три шрифта
(Inter, Amaranth, Vorhersehbar).

✅ В меню `shared → Tokens`, цвета совпадают с Figma, три шрифта визуально разные.

### Шаг 7. Истории Button

`src/shared/ui/button/Button.stories.tsx`:

- `meta`: `title: 'shared/Button'`, `component`, `tags: ['autodocs']`, `args: { children, onClick: fn() }`.
- `argTypes.className` с `control: 'select'` и списком классов из `button.css`
  (на этапе 5 заменится на нормальный `variant`).
- Истории: `Large`, `Medium`, `TextAccent`, `TextSimple`, `TextDanger`, `Disabled`.
- Тесты: клик вызывает `onClick` один раз; по умолчанию `type="button"`; disabled не кликается.

✅ Все истории на чёрном фоне правильным шрифтом, Interactions — зелёные.

### Шаг 8. Истории Input и PasswordInput

- `Input`: `Default`, `WithLeftIcon` (лупа через `mapping`, раздел 8.4), `Small`, `Dark`.
- `PasswordInput`: тест — после клика по глазику `type` поля меняется на `text`,
  у кнопки `aria-pressed="true"`.

### Шаг 9. Тесты в терминале

Если на Windows падает — раздел 3.3.

```bash
npx vitest run --project=storybook
```

Добавьте скрипт `"test": "vitest run"` в `package.json`.

### Шаг 10. Проверки и коммит

```bash
npx tsc -b && npm run lint && npx prettier --check . && npm run build && npm run build-storybook && npm run test
git add -A
git commit -m "chore(storybook): setup with global styles, dark theme, tokens and ui stories"
```

---

## 17. Правила проекта

### 17.1 Где и как называть

| Что               | Правило                                         | Пример                                                                             |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Файл              | `Компонент.stories.tsx` **рядом** с компонентом | `shared/ui/avatar/Avatar.stories.tsx`                                              |
| `title`           | повторяет слой FSD: `слой/Компонент`            | `shared/Avatar`, `entities/MessageBubble`, `widgets/ChatSidebar`, `pages/Messages` |
| Истории-состояния | что видно                                       | `Default`, `Online`, `Disabled`, `Loading`, `Empty`, `Error`, `LongText`           |
| Истории-тесты     | что проверяем                                   | `ClickCallsOnClick`, `DisabledDoesNotClick`, `EnterSendsMessage`                   |

### 17.2 `layout` по слоям

| Слой                 | `layout`                                     | Почему                       |
| -------------------- | -------------------------------------------- | ---------------------------- |
| `shared`, `entities` | `centered` (по умолчанию)                    | маленькие элементы           |
| `widgets`            | `fullscreen` + декоратор с размерами колонки | блок занимает колонку макета |
| `pages`              | `fullscreen`                                 | весь экран                   |

### 17.3 Какие истории делать всегда

- **Все состояния из Figma** — каждое отдельной историей.
- **Disabled / Loading**, если применимо.
- **Крайние случаи:** очень длинное имя, пустые данные, нет аватара, 0 и 999+ непрочитанных.
- Для виджетов: **Loading / Empty / Error** через MSW.
- Минимум один `play`-тест на интерактивный компонент.

### 17.4 Порядок работы над компонентом

1. Figma → выписать состояния.
2. Создать `*.stories.tsx` с этими состояниями.
3. Верстать компонент, пока истории не совпадут с макетом (фон «Figma canvas» для сравнения).
4. `play`-тесты.
5. Вкладка Accessibility — без ошибок.
6. Только потом использовать компонент в приложении.

---

## 18. Частые проблемы

| Симптом                                                                            | Причина                                                                            | Решение                                                   |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Белый фон, Times New Roman, нет цветов                                             | не подключены стили                                                                | `import '../src/shared/styles/index.css'` в `preview.tsx` |
| В редакторе красным `import '…css'` в `preview.tsx`                                | папка `.storybook` не входит в tsconfig                                            | `"include": ["src", ".storybook"]`                        |
| История не появилась в меню                                                        | нет `export default meta` / имя не `*.stories.tsx` / не подходит маска в `main.ts` | проверить три пункта                                      |
| Поменял `main.ts` — ничего не изменилось                                           | `main.ts` читается при старте                                                      | перезапустить                                             |
| `Interactions` красный                                                             | `play` не прошёл                                                                   | вкладка покажет шаг, на котором упало                     |
| `getByRole('button')` не находит                                                   | у кнопки нет доступного имени                                                      | `aria-label`                                              |
| Тултип/модалку не находит                                                          | портал рендерится в `body`                                                         | `within(canvasElement.ownerDocument.body)`                |
| История с `<Link>` падает: «useHref() may be used only in the context of a Router» | нет роутера                                                                        | декоратор `MemoryRouter`                                  |
| «No QueryClient set»                                                               | нет провайдера React Query                                                         | декоратор `QueryClientProvider`                           |
| Данные из прошлой истории «протекают» в следующую                                  | общий кэш / localStorage                                                           | новый `QueryClient` в декораторе, `beforeEach` с очисткой |
| `ERR_CONNECTION_REFUSED` в тестах (Windows)                                        | IPv6 vs IPv4                                                                       | `api: { host: '127.0.0.1' }` (раздел 3.3)                 |
| «Browser connection was closed» в тестах (Windows)                                 | падает chrome-headless-shell                                                       | `channel: 'msedge'` на win32 (раздел 3.3)                 |
| `browserType.launch: Executable doesn't exist`                                     | не скачан браузер Playwright                                                       | `npx playwright install chromium`                         |
| Контрол показывает `[object Object]` для иконки                                    | ReactNode нельзя редактировать                                                     | `mapping` (раздел 8.4) или `control: false`               |

---

## 19. Шпаргалка

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { useArgs } from 'storybook/preview-api';
import { Component } from './Component';

const meta = {
  title: 'shared/Component',
  component: Component,
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    variant: { control: 'select', options: ['a', 'b'] },
  },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variant: Story = { args: { variant: 'b' } };

export const OnLight: Story = { globals: { backgrounds: { value: 'light' } } };

export const Clicks: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
```

| Откуда импортировать           | Что                                                      |
| ------------------------------ | -------------------------------------------------------- |
| `@storybook/react-vite`        | типы `Meta`, `StoryObj`, `Preview`, `StorybookConfig`    |
| `storybook/test`               | `expect`, `fn`, `userEvent`, `within`, `waitFor`, `sb`   |
| `storybook/preview-api`        | `useArgs`, `useGlobals`                                  |
| `storybook/theming`            | `themes`, `create`                                       |
| `storybook/manager-api`        | `addons`                                                 |
| `storybook/viewport`           | `INITIAL_VIEWPORTS`                                      |
| `@storybook/addon-docs/blocks` | `Meta`, `Canvas`, `Controls`, `ColorPalette`, `Typeset`… |

Официальная документация: https://storybook.js.org/docs
