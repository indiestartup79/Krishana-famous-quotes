import json
import os
import unittest
from app import app, QUOTES

class QuoteverseTestCase(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_quotes_dataset_integrity(self):
        """Test that data/quotes.json contains exactly 100 valid quotes."""
        self.assertEqual(len(QUOTES), 100, "Dataset must have exactly 100 quotes.")
        
        ids = set()
        for idx, q in enumerate(QUOTES):
            self.assertIn("id", q)
            self.assertIn("quote", q)
            self.assertIn("author", q)
            self.assertIn("category", q)
            self.assertIn("tags", q)
            self.assertTrue(len(q["quote"].strip()) > 0, f"Quote text at index {idx} is empty.")
            self.assertTrue(len(q["author"].strip()) > 0, f"Author at index {idx} is empty.")
            self.assertTrue(len(q["category"].strip()) > 0, f"Category at index {idx} is empty.")
            self.assertIsInstance(q["tags"], list)
            ids.add(q["id"])

        self.assertEqual(len(ids), 100, "All quote IDs must be unique.")

    def test_index_route(self):
        """Test that GET / returns the HTML page."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Quoteverse", res.data)
        self.assertIn(b"100 Well-Known Quotes", res.data)

    def test_random_quote(self):
        """Test GET /api/quotes/random returns a single random quote."""
        res = self.client.get("/api/quotes/random")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("id", data)
        self.assertIn("quote", data)
        self.assertIn("author", data)
        self.assertIn("category", data)

    def test_random_quote_filtered_by_category(self):
        """Test GET /api/quotes/random with category filter."""
        res = self.client.get("/api/quotes/random?category=Science")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["category"], "Science")

    def test_random_quote_not_found(self):
        """Test GET /api/quotes/random with non-existent criteria returns 404."""
        res = self.client.get("/api/quotes/random?category=nonexistent_xyz")
        self.assertEqual(res.status_code, 404)
        data = json.loads(res.data)
        self.assertIn("error", data)

    def test_get_all_quotes(self):
        """Test GET /api/quotes returns all 100 quotes by default."""
        res = self.client.get("/api/quotes")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["total"], 100)
        self.assertEqual(len(data["quotes"]), 100)

    def test_search_quotes_by_author(self):
        """Test GET /api/quotes?search=Einstein filters correctly."""
        res = self.client.get("/api/quotes?search=Einstein")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["total"] > 0)
        for q in data["quotes"]:
            self.assertTrue("einstein" in q["author"].lower() or "einstein" in q["quote"].lower())

    def test_filter_quotes_by_category(self):
        """Test GET /api/quotes?category=Philosophy filters correctly."""
        res = self.client.get("/api/quotes?category=Philosophy")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["total"] > 0)
        for q in data["quotes"]:
            self.assertEqual(q["category"].lower(), "philosophy")

    def test_filter_quotes_by_author(self):
        """Test GET /api/quotes?author=Steve+Jobs filters correctly."""
        res = self.client.get("/api/quotes?author=Steve+Jobs")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["total"] >= 2)
        for q in data["quotes"]:
            self.assertIn("steve jobs", q["author"].lower())

    def test_get_categories(self):
        """Test GET /api/categories returns unique categories with positive counts."""
        res = self.client.get("/api/categories")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("categories", data)
        self.assertTrue(len(data["categories"]) >= 5)
        total_counted = sum(item["count"] for item in data["categories"])
        self.assertEqual(total_counted, 100)

    def test_get_authors(self):
        """Test GET /api/authors returns distinct authors."""
        res = self.client.get("/api/authors")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("authors", data)
        self.assertTrue(len(data["authors"]) > 20)
        total_counted = sum(item["count"] for item in data["authors"])
        self.assertEqual(total_counted, 100)

    def test_export_quotes_csv(self):
        """Test GET /api/quotes/export returns valid CSV with header and 100 rows."""
        res = self.client.get("/api/quotes/export")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.mimetype, "text/csv")
        csv_text = res.data.decode("utf-8-sig")
        lines = [line for line in csv_text.strip().split("\r\n") if line]
        self.assertEqual(len(lines), 101)  # 1 header + 100 quote rows
        self.assertIn("ID,Quote,Author,Category,Tags", lines[0])

    def test_export_quotes_csv_filtered(self):
        """Test GET /api/quotes/export with category filter."""
        res = self.client.get("/api/quotes/export?category=Science")
        self.assertEqual(res.status_code, 200)
        csv_text = res.data.decode("utf-8-sig")
        lines = [line for line in csv_text.strip().split("\r\n") if line]
        self.assertEqual(len(lines), 11)  # 1 header + 10 science quotes

if __name__ == "__main__":
    unittest.main()
