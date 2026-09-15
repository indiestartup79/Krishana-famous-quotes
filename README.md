# Krishana Famous Quotes (Quoteverse)

A modern, responsive web application built with **Python Flask**, **Vanilla JavaScript**, and **HTML5/CSS3** that serves a curated collection of 100 famous, inspiring quotes across 9 diverse categories.

---

## Features

- 🎲 **Random Quote Generator**: Instant one-click or <kbd>Space</kbd> key random quote display with smooth transitions.
- 🔍 **Live Search**: Instant debounced search filtering by quote text or author name.
- 🏷️ **Category Filter Chips**: Quick filtering across 9 categories (*Science, Technology, Philosophy, Wisdom, Leadership, Inspiration, Literature, Art, Life*).
- 👤 **Author Filter**: Dropdown selector showing all distinct authors with quote counts.
- 📋 **One-Click Copy**: Copy formatted quotes (`"quote" — Author`) directly to clipboard with animated toast feedback.
- 🐦 **Social Sharing**: Share quotes directly to Twitter / X.
- 📱 **Responsive & Accessible**: Mobile-first glassmorphic dark UI with semantic HTML5 and clean typography.
- 🧪 **Comprehensive Test Suite**: Automated unit tests verifying dataset integrity and all REST endpoints.

---

## Tech Stack

- **Backend**: Python 3, Flask (RESTful JSON APIs)
- **Frontend**: Plain Vanilla JavaScript (ES6+), HTML5, Custom CSS3
- **Data**: Static JSON database (`data/quotes.json`) with 100 curated quotes

---

## Project Structure

```text
.
├── app.py                  # Flask web server & REST API endpoints
├── data/
│   └── quotes.json         # 100 curated quotes dataset
├── static/
│   ├── css/
│   │   └── style.css       # Custom responsive stylesheet & design system
│   └── js/
│       └── app.js          # Pure vanilla JS frontend logic & API client
├── templates/
│   └── index.html          # Semantic HTML5 single-page application
├── tests/
│   └── test_app.py         # Automated unittest test suite
├── .gitignore              # Standard git ignore configuration
├── requirements.txt        # Python package dependencies
└── README.md               # Project documentation
```

---

## Getting Started

### 1. Prerequisites
- Python 3.8+
- Flask (`pip install -r requirements.txt`)

### 2. Run the Application
```bash
python3 app.py
```
*(or `./app.py`)*

Open your browser and navigate to:
```
http://127.0.0.1:5001
```

> **Note**: Defaults to port `5001` to avoid macOS AirPlay Receiver port 5000 conflicts. You can specify a custom port using:
> ```bash
> PORT=8080 python3 app.py
> ```

---

## API Endpoints

| Endpoint | Method | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Main web interface | None |
| `/api/quotes/random` | `GET` | Fetch a random quote | `?category=`, `?author=` |
| `/api/quotes` | `GET` | List/search quotes | `?search=`, `?category=`, `?author=` |
| `/api/categories` | `GET` | Unique categories and counts | None |
| `/api/authors` | `GET` | Unique authors and counts | None |

---

## Running Tests

Execute the automated test suite with Python's built-in `unittest`:

```bash
python3 -m unittest discover -s tests -p "test_*.py" -v
```

---

## License

MIT License
