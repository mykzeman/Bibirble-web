# Bibirble (Web Version)

Bibirble is a Wordle-like game where you guess a Bible verse. This is the original web version of the game. There is a C++ version in development: [Bibirble (C++ Version)](https://github.com/mykzeman/bibirble). This web build is also playable on itch.io: [Bibirble (Web Version) on Itch.io](https://mykzeman.itch.io/bibirble).

## Quick Start

- Open `index.html` in a browser.
- Or serve the folder locally for a better experience:

```bash
# using Node (http-server)
npx http-server -c-1

# or using Python 3
python -m http.server 8000
```

## Project Structure

- `index.html` — main entry page
- `styles/` — CSS (styles.css)
- `scripts/` — JavaScript files and data
	- `answer.js`
	- `bible_sections.json`
	- `data.js`
	- `game.js`
	- `keyboard.js`
	- `parse.js`
	- `submit.js`
- `LICENSE` — project license
- `README.md` — this file

## How to Play

Color meanings (applies to both the book and the numeric digits):

- **Grey** — the book is NOT correct or the digit is NOT in the verse.
- **Yellow** — the book is NOT correct but is in the same area (see areas below), or the digit is in the verse but NOT in the right place.
- **Green** — the book is CORRECT or the digit is CORRECT and in the right place.

Areas and books referenced by the game:

- **Torah**
	- Genesis
	- Exodus
	- Leviticus
	- Numbers
	- Deuteronomy

- **Historical Books**
	- Joshua
	- Judges
	- 1 Samuel
	- 2 Samuel
	- 1 Kings
	- 2 Kings
	- 1 Chronicles
	- 2 Chronicles

- **Poetry & Wisdom**
	- Psalms
	- Proverbs
	- Ecclesiastes
	- Song of Solomon
	- Lamentations

- **Small Stories**
	- Job
	- Esther
	- Jonah
	- Ruth
	- Ezra

- **Major Prophets**
	- Isaiah
	- Jeremiah
	- Ezekiel
	- Daniel

- **Minor Prophets**
	- Hosea
	- Joel
	- Amos
	- Obadiah
	- Micah
	- Nahum
	- Habakkuk
	- Zephaniah
	- Haggai
	- Zechariah
	- Malachi
	- Nehemiah

- **Gospels**
	- Matthew
	- Mark
	- Luke
	- John

- **Acts & Hebrews**
	- Acts
	- Hebrews

- **Paul’s Letters**
	- Romans
	- 1 Corinthians
	- 2 Corinthians
	- Galatians
	- Ephesians
	- Philippians
	- Colossians
	- 1 Thessalonians
	- 2 Thessalonians
	- 1 Timothy
	- 2 Timothy
	- Titus
	- Philemon

- **Peter’s Letters**
	- 1 Peter
	- 2 Peter

- **James & Jude**
	- James
	- Jude

- **John’s Letters & Visions**
	- 1 John
	- 2 John
	- 3 John
	- Revelation

## Contributing

Contributions are welcome. To contribute, open an issue or submit a pull request. Small, focused changes are preferred.

## License & Credits

This project includes or references the World English Bible dataset. See the `LICENSE` file for licensing details.

Data source reference: https://github.com/TehShrike/world-english-bible

