# 🌟 Krishana Famous Quotes (Quoteverse)

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask 1.1+](https://img.shields.io/badge/flask-1.1+-green.svg)](https://flask.palletsprojects.com/)
[![JavaScript](https://img.shields.io/badge/javascript-vanilla%20ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Tests: Passing](https://img.shields.io/badge/tests-passing-brightgreen.svg)](tests/)

A modern, responsive, and lightweight web application that serves a curated collection of **100 famous, inspiring quotes** across 9 diverse themes. Built using **Python Flask**, **Plain Vanilla JavaScript**, and **Semantic HTML5/CSS3**.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Running](#installation--running)
- [API Reference](#-api-reference)
- [Automated Testing](#-automated-testing)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [License](#-license)

---

## ✨ Features

- 🎲 **Hero Random Quote Showcase**: Instant one-click random quote generator with smooth animations.
- ⌨️ **Keyboard Shortcut Support**: Tap <kbd>Space</kbd> anywhere on the page to instantly fetch another random quote.
- 🔍 **Real-Time Debounced Search**: Instant live filtering that matches against quote text and author names without server spamming (250ms debounce).
- 🏷️ **Interactive Category Chips**: Filter across 9 categories (*Science, Technology, Philosophy, Wisdom, Leadership, Inspiration, Literature, Art, Life*) with real-time count badges.
- 👤 **Author Dropdown Filter**: Alphabetically indexed selector displaying all authors and their quote counts.
- 🎯 **"Random from Results"**: Pick a random quote directly from the active search or category filtered results.
- 📋 **One-Click Clipboard Copy**: Formatted quote copying (`"quote" — Author`) with toast alert confirmation.
- 🐦 **Social Sharing**: One-click sharing to Twitter / X.
- 📱 **Glassmorphic Responsive UI**: Mobile-first design with modern blur effects, dark mode aesthetic, and accessible focus outlines.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Browser Client                       │
│  ┌────────────────────┐      ┌──────────────────────┐  │
│  │ templates/index.html│      │  static/css/style.css│  │
│  └─────────┬──────────┘      └──────────────────────┘  │
│            │ (DOM & Events)                            │
│  ┌─────────▼──────────┐                                │
│  │   static/js/app.js │ ◄── (State, Debounce, Fetch)   │
│  └─────────┬──────────┘                                │
└────────────┼───────────────────────────────────────────┘
             │ HTTP GET (REST API / HTML)
             ▼
┌────────────────────────────────────────────────────────┐
│                   Flask Server                         │
│  ┌────────────────────┐                                │
│  │       app.py       │ ◄── (Port 5001 / REST Endpoints│
│  └─────────┬──────────┘                                │
│            │ In-Memory Fast Lookup                     │
│  ┌─────────▼──────────┐                                │
│  │   data/quotes.json │ ◄── (100 Curated Quotes)       │
│  └────────────────────┘                                │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask (RESTful JSON APIs, in-memory caching)
- **Frontend**: Pure Vanilla JavaScript (ES6+), Semantic HTML5, CSS3 Custom Properties
- **Data Layer**: Static JSON database (`data/quotes.json`)
- **Testing**: Python `unittest` framework

---

## 📁 Project Structure

```text
.
├── app.py                  # Flask application & REST API routes
├── data/
│   └── quotes.json         # 100 curated quotes dataset
├── static/
│   ├── css/
│   │   └── style.css       # Custom stylesheet & glassmorphic theme
│   └── js/
│       └── app.js          # Client-side vanilla JS logic & state management
├── templates/
│   └── index.html          # Semantic HTML5 single-page application
├── tests/
│   └── test_app.py         # Automated unittest suite (11 tests)
├── .gitignore              # Standard git ignore rules (Python, OS, IDEs)
├── requirements.txt        # Python package dependencies
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+** installed on your system
- **Flask** (`pip install flask`)

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/indiestartup79/Krishana-famous-quotes.git
   cd Krishana-famous-quotes
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   python3 app.py
   ```
   *(or execute directly with `./app.py`)*

4. **Access the application:**
   Open your browser and navigate to:
   ```
   http://127.0.0.1:5001
   ```

> **Note on Port 5001**: Port 5001 is used by default to prevent conflicts with macOS's AirPlay Receiver (which occupies port 5000). To override:
> ```bash
> PORT=8080 python3 app.py
> ```

---

## 📡 API Reference

### 1. Get Random Quote
- **URL**: `/api/quotes/random`
- **Method**: `GET`
- **Query Parameters**:
  - `category` *(optional)*: Filter by category (e.g. `Science`)
  - `author` *(optional)*: Filter by author name (e.g. `Einstein`)
- **Example Response**:
  ```json
  {
    "id": 1,
    "quote": "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.",
    "author": "Albert Einstein",
    "category": "Science",
    "tags": ["imagination", "knowledge"]
  }
  ```

### 2. Search & Filter Quotes
- **URL**: `/api/quotes`
- **Method**: `GET`
- **Query Parameters**:
  - `search` *(optional)*: Substring match against quote text or author
  - `category` *(optional)*: Match category (`all` or specific category)
  - `author` *(optional)*: Match author name
- **Example Request**: `/api/quotes?search=jobs&category=Inspiration`
- **Example Response**:
  ```json
  {
    "total": 2,
    "quotes": [
      {
        "id": 45,
        "quote": "The only way to do great work is to love what you do.",
        "author": "Steve Jobs",
        "category": "Inspiration",
        "tags": ["passion", "work", "greatness"]
      }
    ]
  }
  ```

### 3. List Categories
- **URL**: `/api/categories`
- **Method**: `GET`
- **Example Response**:
  ```json
  {
    "total": 9,
    "categories": [
      { "category": "Art", "count": 13 },
      { "category": "Inspiration", "count": 14 },
      { "category": "Leadership", "count": 12 },
      { "category": "Life", "count": 6 },
      { "category": "Literature", "count": 8 },
      { "category": "Philosophy", "count": 10 },
      { "category": "Science", "count": 10 },
      { "category": "Technology", "count": 10 },
      { "category": "Wisdom", "count": 17 }
    ]
  }
  ```

### 4. List Authors
- **URL**: `/api/authors`
- **Method**: `GET`
- **Example Response**:
  ```json
  {
    "total": 51,
    "authors": [
      { "author": "Albert Camus", "count": 1 },
      { "author": "Albert Einstein", "count": 3 },
      ...
    ]
  }
  ```

---

## 🧪 Automated Testing

The project includes an automated test suite verifying dataset schema integrity, all REST endpoints, query filters, and error handling.

Run tests using Python's built-in `unittest`:

```bash
python3 -m unittest discover -s tests -p "test_*.py" -v
```

### Test Output:
```text
test_filter_quotes_by_author (test_app.QuoteverseTestCase) ... ok
test_filter_quotes_by_category (test_app.QuoteverseTestCase) ... ok
test_get_all_quotes (test_app.QuoteverseTestCase) ... ok
test_get_authors (test_app.QuoteverseTestCase) ... ok
test_get_categories (test_app.QuoteverseTestCase) ... ok
test_index_route (test_app.QuoteverseTestCase) ... ok
test_quotes_dataset_integrity (test_app.QuoteverseTestCase) ... ok
test_random_quote (test_app.QuoteverseTestCase) ... ok
test_random_quote_filtered_by_category (test_app.QuoteverseTestCase) ... ok
test_random_quote_not_found (test_app.QuoteverseTestCase) ... ok
test_search_quotes_by_author (test_app.QuoteverseTestCase) ... ok

----------------------------------------------------------------------
Ran 11 tests in 0.05s

OK
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Fetch a new random quote (disabled when typing in search or dropdowns) |

---

## 📄 License

This project is licensed under the MIT License.
