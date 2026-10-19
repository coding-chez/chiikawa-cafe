<div align="center">

# Chiikawa Café

**A little treat, a lot of happiness.**

<p>
  <img src="public/assets/characters/chiikawa.png" width="64" height="64" alt="Chiikawa" />
  &nbsp;
  <img src="public/assets/characters/usagi.png" width="64" height="64" alt="Usagi" />
  &nbsp;
  <img src="public/assets/characters/hachiware.png" width="64" height="64" alt="Hachiware" />
  &nbsp;
  <img src="public/assets/characters/momonga.png" width="64" height="64" alt="Momonga" />
</p>

*A character-inspired café ordering experience.*

A responsive café website featuring an illustrated menu, interactive shopping cart, and simulated checkout. Built with React and designed around a soft pastel aesthetic inspired by Chiikawa.

**React 19 · Vite 8 · Tailwind CSS 4 · React Router · JavaScript**

[Features](#features) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Design](#design)

</div>

---

## Overview

Chiikawa Café is a frontend web application developed as a midterm project. It brings together character-inspired visuals and the familiar experience of browsing a café menu, choosing products, and placing an order.

The application includes 12 illustrated food and drink items across four categories. Visitors can search and filter the menu, view individual products, manage their cart, and complete a demo checkout.

The project uses object-oriented JavaScript for its product, cart, and order models. Cart contents and demo order receipts are saved locally in the browser, allowing the experience to continue after a page refresh.

## Features

### Menu and Product Browsing
- Browse 12 products across Desserts, Meals, Drinks, and Snacks.
- Search products by name.
- Filter by category and sort menu items.
- Open individual product pages with descriptions, prices, and quantity controls.
- Navigate between pages using responsive desktop and mobile layouts.

### Shopping Cart
- Add products from the homepage, menu, or product details.
- Automatically combine quantities when the same product is added again.
- Increase, decrease, or remove cart items.
- View updated quantities, subtotals, and order totals.
- Keep cart contents after refreshing the browser.

### Demo Checkout
- Place a simulated order without creating an account.
- Generate a unique demo order reference.
- View an order confirmation with purchased items and totals.
- Restore the most recent confirmation after refreshing the page.
- Recover interrupted checkout operations using browser storage.

All prices are displayed in Philippine pesos (PHP). Checkout is for demonstration only; no actual purchases or payments are made.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React 19 | Component-based user interface |
| Vite 8 | Development server and production builds |
| Tailwind CSS 4 | Styling and responsive layouts |
| React Router | Client-side navigation |
| JavaScript (ES6+) | Application logic and object-oriented models |
| localStorage | Cart persistence and demo order recovery |

## Getting Started

### Prerequisites

Install Node.js and npm before running the project.

Use a Node.js version supported by the installed Vite version.

### Installation

Clone the repository:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
```

Navigate to the application directory:

```bash
cd REPOSITORY/chiikawa
```

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open the local address shown in the terminal, usually `http://localhost:5173`.

> Replace the repository URL and directory above with the actual GitHub repository details before publishing.

### Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

## Project Structure

```text
chiikawa/
├── public/
│   └── assets/
│       ├── characters/       # Character illustrations
│       └── food/             # Product artwork
├── src/
│   ├── components/           # Reusable UI components
│   ├── context/              # Shared cart state
│   ├── data/                 # Products, categories, and UI content
│   ├── hooks/                # Custom React hooks
│   ├── models/               # Object-oriented application models
│   ├── pages/                # Application pages
│   └── utils/                # Catalog and storage utilities
├── docs/
│   ├── figma/                # Design references and exports
│   └── uml/                  # UML class diagram
└── package.json
```

### Application Models

The application uses six JavaScript classes:

| Class | Responsibility |
| --- | --- |
| `Category` | Defines product categories and their relationships |
| `Product` | Represents menu items and their properties |
| `CartItem` | Stores a selected product and its quantity |
| `Cart` | Manages selected items and calculates totals |
| `OrderItem` | Preserves product details at checkout |
| `Order` | Represents a completed demo order |

These models keep product data and cart calculations separate from the React interface.

## Design

The interface uses rounded cards, pastel colors, illustrated products, and the Nunito typeface. Desktop and mobile layouts were designed in Figma before implementation.

The design includes five primary screens:

1. Homepage
2. Menu
3. Food Details
4. Shopping Cart
5. Order Confirmation

Each screen has desktop and mobile versions.

**Design resources**

- [Figma Design](https://www.figma.com/design/m5qqoPSihlLx8d3dn0JL4J/Chiikawa-Caf%C3%A9---UI-UX?node-id=0-1)
- [Design Exports](docs/figma)
- [UML Class Diagram](docs/uml)

## Notes

- This is a frontend-only application.
- No account registration or backend service is required.
- Cart and order information is stored in the user's browser.
- Clearing browser storage removes locally saved cart and order data.
- The checkout process is a simulation and does not process payments.

## Disclaimer

This is an unofficial academic project created for educational purposes. It is not affiliated with, sponsored by, or endorsed by Chiikawa or its rights holders.

Chiikawa characters and related artwork belong to their respective owners.

---

<div align="center">

Made with care, curiosity, and a little café magic.

( ˶ˆ꒳ˆ˵ )

</div>