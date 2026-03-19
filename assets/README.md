Place your real CV PDF file in this folder and name it exactly:

  Othembela_Nothanaza_CV.pdf

The Download CV button on the site (`index.html`) links to `assets/Othembela_Nothanaza_CV.pdf` and includes the `download` attribute to prompt a download.

Steps:
1. Save your PDF as `Othembela_Nothanaza_CV.pdf`.
2. Move the file into this `assets/` folder.
3. Open `index.html` in the browser or run a local server to test.

Local test (from project root):

```bash
# macOS / zsh - serve current folder on http://localhost:8000
python3 -m http.server 8000
# then open http://localhost:8000 in your browser and click "Download CV"
```

If you want a different filename or location, update the `href` of the Download CV link in `index.html` accordingly.
