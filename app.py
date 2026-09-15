#!/usr/bin/env python3
import csv
import io
import json
import os
import random
from flask import Flask, render_template, request, jsonify, Response

app = Flask(__name__)

# Load 100 quotes from data/quotes.json
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "quotes.json")

def load_quotes():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

QUOTES = load_quotes()

@app.route("/")
def index():
    """Serves the main single-page quote application."""
    return render_template("index.html")

@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    """
    Returns a random quote.
    Supports optional query filters:
      - category: filter by category name (case-insensitive)
      - author: filter by author name (case-insensitive)
    """
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    pool = QUOTES
    if category:
        pool = [q for q in pool if q["category"].lower() == category]
    if author:
        pool = [q for q in pool if author in q["author"].lower()]

    if not pool:
        return jsonify({
            "error": "No quotes found matching the specified criteria."
        }), 404

    return jsonify(random.choice(pool))

@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    """
    Returns a list of quotes matching optional filters:
      - search: matches within quote text or author
      - category: exact category match (case-insensitive)
      - author: matches within author name (case-insensitive)
    """
    search_query = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    results = QUOTES

    if category and category != "all":
        results = [q for q in results if q["category"].lower() == category]

    if author:
        results = [q for q in results if author in q["author"].lower()]

    if search_query:
        results = [
            q for q in results
            if search_query in q["quote"].lower() or search_query in q["author"].lower()
        ]

    return jsonify({
        "total": len(results),
        "quotes": results
    })

@app.route("/api/quotes/export", methods=["GET"])
def export_quotes_csv():
    """Exports matching quotes as a downloadable CSV file."""
    search_query = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    results = QUOTES

    if category and category != "all":
        results = [q for q in results if q["category"].lower() == category]

    if author:
        results = [q for q in results if author in q["author"].lower()]

    if search_query:
        results = [
            q for q in results
            if search_query in q["quote"].lower() or search_query in q["author"].lower()
        ]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Quote", "Author", "Category", "Tags"])
    for q in results:
        writer.writerow([
            q.get("id"),
            q.get("quote"),
            q.get("author"),
            q.get("category"),
            "; ".join(q.get("tags", []))
        ])

    category_slug = category if (category and category != "all") else "all"
    filename = f"quotes-{category_slug}.csv"
    return Response(
        "\ufeff" + output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Returns a list of unique categories and their quote counts."""
    category_counts = {}
    for q in QUOTES:
        cat = q["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

    sorted_categories = sorted(
        [{"category": cat, "count": count} for cat, count in category_counts.items()],
        key=lambda x: x["category"]
    )
    return jsonify({
        "total": len(sorted_categories),
        "categories": sorted_categories
    })

@app.route("/api/authors", methods=["GET"])
def get_authors():
    """Returns a list of unique authors and their quote counts."""
    author_counts = {}
    for q in QUOTES:
        author = q["author"]
        author_counts[author] = author_counts.get(author, 0) + 1

    sorted_authors = sorted(
        [{"author": author, "count": count} for author, count in author_counts.items()],
        key=lambda x: x["author"]
    )
    return jsonify({
        "total": len(sorted_authors),
        "authors": sorted_authors
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"\n🚀 Quoteverse is starting on http://127.0.0.1:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=True)
