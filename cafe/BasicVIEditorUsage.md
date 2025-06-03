---

## **Basic `vi` Editor Usage Guide**

### 🔄 **Vi Modes**

`vi` operates in **two main modes**:

1. **Normal Mode** (default)

   * Used for navigation and commands.
   * Press `Esc` anytime to return here.

2. **Insert Mode**

   * Used for text input.
   * Enter insert mode by pressing:

     * `i` – Insert before cursor
     * `I` – Insert at beginning of line
     * `a` – Append after cursor
     * `A` – Append at end of line
     * `o` – Open a new line below
     * `O` – Open a new line above

---

Here’s a concise and practical guide to using `vi` (or `vim`, its improved version), which is a powerful text editor in Unix/Linux systems:

### 📂 **Opening a File**

```bash
vi filename
```

If the file doesn't exist, `vi` will create it upon saving.

---

### 🖊️ **Editing Text**

* Press `i` to enter **Insert Mode**, then start typing.
* Press `Esc` to return to **Normal Mode**.

---

### 💾 **Saving & Exiting**

* `:w` – Save (write) file
* `:q` – Quit
* `:wq` – Save and quit
* `:q!` – Quit **without saving**
* `ZZ` – Save and quit (same as `:wq`)

---

### 🧭 **Navigation in Normal Mode**

* `h` – Move left

* `l` – Move right

* `j` – Move down

* `k` – Move up

* `0` – Start of line

* `^` – First non-blank character of line

* `$` – End of line

* `G` – Go to last line

* `gg` – Go to first line

* `:n` – Go to line number `n` (e.g., `:15`)

---

### 🔄 **Undo & Redo**

* `u` – Undo last change
* `U` – Undo changes on the current line
* `Ctrl + r` – Redo undone change

---

### 🗑️ **Deleting Text**

* `x` – Delete character under cursor
* `dd` – Delete current line
* `d$` – Delete to end of line
* `dw` – Delete a word

---

### 📋 **Copy & Paste**

* `yy` – Yank (copy) current line
* `y5y` – Yank 5 lines
* `p` – Paste after cursor
* `P` – Paste before cursor

---

### 🔍 **Searching**

* `/text` – Search **forward** for "text"
* `?text` – Search **backward** for "text"
* `n` – Repeat search
* `N` – Repeat search in reverse

---

### ✅ **Tips**

* Always press `Esc` before entering a command.
* Vi does not show anything when you type commands until you hit `:` (colon).
* You can enable line numbers with `:set number`.

---