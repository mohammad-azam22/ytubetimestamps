# YTube Timestamps ⏱️

**YTube Timestamps** is a simple Chrome extension that lets you *save and manage timestamps* in YouTube videos. It enables users to quickly bookmark key moments — perfect for revisiting important parts of longer videos. This project was forked from [**youtube-bookmarker-finished-code**](https://github.com/raman-at-pieces/youtube-bookmarker-finished-code) and used as part of an open source contribution via a pull request.

---

## 🧠 Features

✔ Save timestamps for the current YouTube video  
✔ Add multiple bookmarks per video  
✔ Quickly jump back to saved timestamps  
✔ Simple Chrome extension interface

<img width="1917" height="134" alt="517848705-68ba6cb7-bba7-458b-891c-22b4f9d4e3cb-1" src="https://github.com/user-attachments/assets/1e14ba9f-e709-4be1-bd16-b4e7528e760c" />
<img width="1920" height="128" alt="517848703-e8c04d35-13b5-4bf9-a08e-39bcaaf9cabf" src="https://github.com/user-attachments/assets/253f5da5-db55-414d-862d-0c34ad5b39a3" />


---

## 📦 Installation

> ⚠️ This isn't published on the Chrome Web Store — you install it manually in Developer Mode.

1. Clone the repository:

   ```bash
   git clone https://github.com/mohammad-azam22/ytubetimestamps.git
   ```
2. Open Chrome and go to: `chrome://extensions/`
3. Enable Developer mode (toggle at top right).
4. Click Load unpacked and select the cloned folder.
5. Once loaded, the extension should appear in your Chrome toolbar.

## 🚀 How to Use

1. Navigate to any YouTube video.
2. A new bookmark button will appear in the bottom-left controls panel.
3. Press the bookmark button to save the current timestamp.
4. Click a saved timestamp to jump to that moment in the video.

## 📁 Project Structure
| File  | Purpose |
|-------|-----|
| manifest.json | Chrome extension metadata |
| popup.html/css/js | UI for saved timestamps |
| background.js | Background logic |
| contentScript.js | Inserts scripts into YouTube pages |
| utils.js | Shared helper functions |
| assets/ | Images and icons |

## 🤝 Contributing

This project is open source — contributions are welcome!

If you’d like to contribute:
1. Fork the repo.
2. Create a new feature branch.
3. Make your changes.
4. Open a Pull Request.

## 📄 License

This extension is licensed under the MIT License.

## ❤️ Acknowledgements

This project is based on the YouTube Bookmarker finished code by Raman originally created for the Build a Chrome Extension tutorial.
