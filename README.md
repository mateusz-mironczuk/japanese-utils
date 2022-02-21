# japanese-utils
Various utilities to prepare data for apps which helps me learn Japanese.

## Utilities
The repository contains following utility scripts:
- [generate-kanji-files](#generate-kanji-files)

### generate-kanji-files
Generates kanji files for the `add-kanji-info` project.

#### Usage
1. Obtain a legal `kanjidic2.xml` file.
2. Run `node src/generate-kanji-files.js <path to the kanjidic2.xml file>`.
3. The generated files will be saved inside `_kanji` directory in a current
    working directory.

#### Notes
Because of current Anki and AnkiDroid limitations all files are generated as
JavaScript files and the contents of the files are stored inside the
`window.Kanjis` key.

## Acknowledgements
The *Remembering the Kanji* characters list is based on [this thread](https://www.reddit.com/r/LearnJapanese/comments/1a126a/all_2200_kanji_from_heisigs_remembering_the_kanji/).
