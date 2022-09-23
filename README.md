# japanese-utils
Various utilities to prepare data for apps which help me learn Japanese.

## Utilities
The repository contains following utility scripts:
- [generate-core-deck](#generate-core-deck)
- [generate-examples-deck](#generate-examples-deck)
- [generate-kanji-files](#generate-kanji-files)
- [filter-kanji-svg](#filter-kanji-svg)
- [find-equals-in-decks](#find-equals-in-decks)

### generate-core-deck
Generates a deck based on [iKnow.jp](https://iknow.jp/content/japanese) and
[Takoboto](https://takoboto.jp/).

#### Usage
1. Run `node src/generate-core-deck.js <core>`.
    - `<core>` is a number describing an iKnow.jp lesson.
2. The generated deck will be saved in a `decks` directory inside a current
    working directory.

### generate-examples-deck
Generates an examples deck based on [iKnow.jp](https://iknow.jp/content/japanese).

#### Usage
1. Run `node src/generate-examples-deck.js <core>`.
    - `<core>` is a number describing an iKnow.jp lesson.
2. The generated deck will be saved in a `decks` directory inside a current
    working directory.

### generate-kanji-files
Generates kanji files for the `add-kanji-info` project.

#### Usage
1. Obtain a legal [kanjidic2.xml](http://www.edrdg.org/wiki/index.php/KANJIDIC_Project) file.
2. Run `node src/generate-kanji-files.js <path to the kanjidic2.xml file>`.
3. The generated files will be saved inside `_kanji` directory in a current
    working directory.

#### Notes
Because of current Anki and AnkiDroid limitations all files are generated as
JavaScript files and the contents of the files are stored inside the
`window.Kanjis` key.

### filter-kanji-svg
Filters kanji SVG files to the most common ones.

#### Usage
1. Obtain a legal [Kanji SVG project's](http://kanjivg.tagaini.net/) SVG files.
2. Run `node src/filter-kanji-svg.js <path to a directory with the SVG files>`.
3. The filtered files will be saved inside `_svg` directory in a current
    working directory. File names are preceded with an underscore character.

### find-equals-in-decks.js
Searches a directory with iKnow Core decks for words written in the same way and
generates a report.

#### Usage
1. Run `node src/find-equals-in-decks.js <directory with the decks>`
    - `<directory with the decks>` A path to the directory which contains the
        decks.
2. The generated report will be saved in a file `equals.json` in the current
    working directory.

## Acknowledgements
The *Remembering the Kanji* characters list is based on [this thread](https://www.reddit.com/r/LearnJapanese/comments/1a126a/all_2200_kanji_from_heisigs_remembering_the_kanji/).
