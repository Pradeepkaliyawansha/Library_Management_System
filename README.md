# 📚 Library Management System

> A modern, feature-rich desktop application for managing university library operations built with Electron.js

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-40.0.0-47848f.svg)](https://www.electronjs.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Building](#building)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Overview

The **Library Management System** is a comprehensive desktop application designed specifically for university libraries and educational institutions. It streamlines the process of managing books, students, and borrowing transactions while providing powerful analytics to help librarians make data-driven decisions.

Built with modern web technologies and packaged as a desktop application using Electron, it offers a native-like experience with the flexibility of web development.

### Why This System?

- **No Internet Required** - Works completely offline
- **Fast & Responsive** - Desktop performance
- **User-Friendly** - Intuitive interface with dark/light themes
- **Comprehensive** - Covers all library management needs
- **Analytics-Driven** - Make informed decisions with built-in analytics
- **Cross-Platform** - Works on Windows, macOS, and Linux

---

## ✨ Features

### 📚 **Book Management**

- ➕ Add new books with ISBN, title, author, publisher, category
- ✏️ Edit existing book information
- 🗑️ Delete books from the collection
- 📊 Track total and available copies
- 🔍 Search books by ISBN, title, author, or category
- 📤 Export book data to Excel

### 👨‍🎓 **Student Management**

- ➕ Register new students with ID, name, email, phone
- ✏️ Update student information
- 🗑️ Remove students from the system
- 👀 View books currently borrowed by each student
- 🔍 Search students by ID, name, email, or department
- 📤 Export student data to Excel

### 🔄 **Transaction Management**

- 📖 Issue books to students
- ✅ Process book returns
- 📅 Automatic due date calculation (14-day loan period)
- ⚠️ Overdue book tracking and highlighting
- 🔍 Search transactions by student or book
- 📤 Export transaction history to Excel
- 🚫 Prevent duplicate issues (same book to same student)

### 📊 **Analytics Dashboard** _(NEW)_

- 📈 **Top 10 Most Issued Books** - Identify popular titles
- 👥 **Top 10 Most Active Students** - Track engaged users
- 📉 **Issue & Return Trends** - 12-month pattern analysis
- 🥧 **Category Distribution** - Breakdown by book categories
- ⏰ **Overdue Analysis** - Books overdue by duration
- 📅 **Daily Activity** - Last 30 days borrowing patterns
- 🎯 **Key Statistics** - Total issues, returns, overdue count, average loan period
- 📆 **Date Filtering** - Analyze specific time periods

### 🏠 **Dashboard**

- 📊 Real-time statistics (students, books, copies, issues)
- 🕐 Recently added students
- 📚 Recently added books
- ⚡ Quick actions for common tasks
- 🎨 Beautiful, animated interface

### 🎨 **User Interface**

- 🌓 Dark and Light theme support
- 📱 Responsive design (works on all screen sizes)
- ✨ Smooth animations and transitions
- 🎯 Intuitive navigation
- ⌨️ Keyboard shortcuts support
- 🖱️ User-friendly forms and tables

### 💾 **Data Management**

- 💿 SQLite database (file-based, no server required)
- 📁 Automatic database backup and restore
- 📤 Export data to Excel (XLSX format)
- 🔄 Real-time data synchronization
- 💨 Fast in-memory caching
- 🛡️ Data validation and error handling

### 🔧 **System Features**

- 🔄 Auto-update support
- 📋 Application menu with shortcuts
- 🖥️ Cross-platform (Windows, macOS, Linux)
- 📦 Easy installation and deployment
- 🎛️ Configurable settings
- 📝 Comprehensive logging

---

## 🖼️ Screenshots

### Dashboard

```
┌────────────────────────────────────────────────────────────┐
│  📚 Library Management System - Aquaculture Unit      🌙  │
├────────────────────────────────────────────────────────────┤
│  👥 150  📚 1,234  ✓ 987  📖 247                         │
│  Students  Books  Available  Issued                        │
├────────────────────────────────────────────────────────────┤
│  [🏠 Dashboard] [👨‍🎓 Students] [📕 Books] [🔄 Transactions]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Welcome Back                                              │
│  Here's what's happening in your library today             │
│                                                            │
│  Quick Actions                                             │
│  [➕ Add Student] [📚 Add Book] [👁️ View Activity]        │
│                                                            │
│  Recently Added Students    |    Recently Added Books      │
│  ┌──────────────────────┐  |  ┌──────────────────────┐   │
│  │ John Doe (CS401)      │  |  │ Clean Code            │   │
│  │ Computer Science      │  |  │ By Robert Martin      │   │
│  └──────────────────────┘  |  └──────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Students Management

```
┌────────────────────────────────────────────────────────────┐
│  Student Management                    [📊 Export] [+ Add] │
│  Manage your student database                              │
├────────────────────────────────────────────────────────────┤
│  🔍 Search students...                                      │
├────────────────────────────────────────────────────────────┤
│  ID      │ Name          │ Email        │ Dept    │ Actions│
│  CS401   │ John Doe      │ john@...     │ CS      │ [📚][✏️][🗑️]│
│  EE201   │ Jane Smith    │ jane@...     │ EE      │ [📚][✏️][🗑️]│
│  ME301   │ Bob Johnson   │ bob@...      │ ME      │ [📚][✏️][🗑️]│
└────────────────────────────────────────────────────────────┘
```

### Analytics Dashboard

```
┌────────────────────────────────────────────────────────────┐
│  📊 Book Analytics & Insights                         ✕   │
├────────────────────────────────────────────────────────────┤
│  From [____] To [____] [Apply Filter] [Reset]              │
├────────────────────────────────────────────────────────────┤
│  Total Issues  Total Returns  Overdue  Avg Loan Period    │
│      847           782          23       11.3 days         │
├────────────────────────────────────────────────────────────┤
│  📖 Top 10 Most Issued Books    👥 Top 10 Active Students │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  #1 Clean Code ████████████ 145  #1 Sarah J. ████████ 32 │
│  #2 Design Pat ████████ 127      #2 Michael C ███████ 28 │
│  #3 Algorithm  ██████ 98          #3 Emma W.   ██████ 24 │
│                                                            │
│  📈 Issue & Return Trends (Last 12 Months)                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  [Monthly trend chart with issues and returns]            │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- **Electron.js** - Desktop application framework
- **HTML5** - Markup
- **CSS3** - Styling with custom properties and animations
- **Vanilla JavaScript** - No framework dependencies
- **Google Fonts** - Playfair Display, DM Sans

### Backend

- **Node.js** - Runtime environment
- **SQL.js** - SQLite compiled to JavaScript
- **ExcelJS** - Excel file generation
- **Electron IPC** - Inter-process communication

### Development Tools

- **Electron Builder** - Application packaging
- **Electron Updater** - Auto-update functionality
- **Git** - Version control

### Database

- **SQLite** - File-based SQL database
- **SQL.js** - In-browser SQLite

---

## 📥 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** (optional) - For cloning the repository

### Step 1: Clone or Download

**Option A: Clone with Git**

```bash
git clone https://github.com/yourusername/library-management.git
cd library-management
```

**Option B: Download ZIP**

1. Download the ZIP file from the repository
2. Extract to your desired location
3. Open terminal in the extracted folder

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:

- Electron
- SQL.js
- ExcelJS
- Electron Builder
- And other dependencies

### Step 3: Run the Application

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The application should launch automatically. If it doesn't, check the console for errors.

---

## 📖 Usage

### Getting Started

1. **Launch the Application**
   - Double-click the installed application icon
   - Or run `npm start` from the project directory

2. **Navigate the Interface**
   - Use the navigation tabs at the top: Dashboard, Students, Books, Transactions
   - Toggle between dark and light themes using the moon/sun icon

3. **Add Your First Student**
   - Go to the "Students" tab
   - Click "+ Add Student"
   - Fill in the required information
   - Click "Save Student"

4. **Add Your First Book**
   - Go to the "Books" tab
   - Click "+ Add Book"
   - Fill in book details (ISBN, title, author, etc.)
   - Click "Save Book"

5. **Issue a Book**
   - Go to the "Books" tab
   - Find the book you want to issue
   - Click the "Issue" button
   - Enter the student ID
   - Confirm the issue

6. **Return a Book**
   - Go to the "Transactions" tab
   - Find the active transaction
   - Click "Return" button
   - Confirm the return

7. **View Analytics**
   - Go to the "Transactions" tab
   - Click "📊 View Analytics"
   - Explore charts and statistics
   - Use date filters for specific periods

### Common Operations

#### Managing Students

```
Add Student → Students Tab → + Add Student → Fill Form → Save
Edit Student → Find Student → Edit Button → Update Info → Save
Delete Student → Find Student → Delete Button → Confirm
View Student Books → Find Student → Books Button
Search Students → Use search box at top of table
```

#### Managing Books

```
Add Book → Books Tab → + Add Book → Fill Form → Save
Edit Book → Find Book → Edit Button → Update Info → Save
Delete Book → Find Book → Delete Button → Confirm
Issue Book → Find Book → Issue Button → Enter Student ID → Confirm
Search Books → Use search box at top of table
```

#### Managing Transactions

```
Issue Book → Books Tab → Find Book → Issue → Enter Student ID
Return Book → Transactions Tab → Find Transaction → Return → Confirm
View History → Transactions Tab → Browse all transactions
Filter Transactions → Use search box to find specific transactions
Export Data → Transactions Tab → Export to Excel button
```

#### Using Analytics

```
Open Analytics → Transactions Tab → 📊 View Analytics
Filter by Date → Set From/To dates → Apply Filter
View Charts → Scroll through different visualizations
Close Analytics → Click X or click outside modal
```

### Keyboard Shortcuts

```
Ctrl + Shift + S    -  Add New Student
Ctrl + Shift + B    -  Add New Book
Ctrl + F            -  Focus Search Box
Ctrl + S            -  Save Form (when form is open)
F5                  -  Refresh Data
Ctrl + Shift + T    -  Toggle Theme
Ctrl + E            -  Export Data
ESC                 -  Close Modal
```

### Database Location

The SQLite database file is stored at:

- **Windows:** `C:\Users\{YourUsername}\AppData\Roaming\Library Management System\library.db`
- **macOS:** `~/Library/Application Support/Library Management System/library.db`
- **Linux:** `~/.config/Library Management System/library.db`

---

## 📁 Project Structure

```
library-management-system/
│
├── build/                          # Build resources
│   ├── icon.ico                    # Windows icon
│   ├── icon.icns                   # macOS icon
│   └── icons/                      # Linux icons
│
├── dist/                           # Built application (generated)
│
├── node_modules/                   # Dependencies (generated)
│
├── src/                            # Source code
│   ├── main/                       # Main process (Electron)
│   │   ├── database/               # Database logic
│   │   │   ├── db.js               # Database initialization
│   │   │   ├── migrations.js       # Database migrations
│   │   │   └── models/             # Data models
│   │   │       ├── Book.js         # Book model
│   │   │       ├── Student.js      # Student model
│   │   │       └── Transaction.js  # Transaction model
│   │   │
│   │   ├── handlers/               # IPC handlers
│   │   │   ├── bookHandlers.js     # Book operations
│   │   │   ├── studentHandlers.js  # Student operations
│   │   │   ├── transactionHandlers.js  # Transaction operations
│   │   │   └── exportHandlers.js   # Export operations
│   │   │
│   │   ├── services/               # Services
│   │   │   ├── cacheService.js     # Data caching
│   │   │   └── exportService.js    # Excel export
│   │   │
│   │   ├── utils/                  # Utilities
│   │   │   ├── menu.js             # Application menu
│   │   │   └── updater.js          # Auto-updater
│   │   │
│   │   ├── index.js                # Main entry point
│   │   └── window.js               # Window management
│   │
│   ├── renderer/                   # Renderer process (UI)
│   │   ├── css/                    # Stylesheets
│   │   │   ├── themes/             # Theme files
│   │   │   │   ├── variables.css   # CSS variables
│   │   │   │   ├── dark.css        # Dark theme
│   │   │   │   └── light.css       # Light theme
│   │   │   │
│   │   │   ├── components/         # Component styles
│   │   │   │   ├── header.css      # Header styles
│   │   │   │   ├── navigation.css  # Navigation styles
│   │   │   │   ├── dashboard.css   # Dashboard styles
│   │   │   │   ├── forms.css       # Form styles
│   │   │   │   ├── tables.css      # Table styles
│   │   │   │   ├── modal.css       # Modal styles
│   │   │   │   └── analytics.css   # Analytics styles
│   │   │   │
│   │   │   └── main.css            # Main stylesheet
│   │   │
│   │   ├── js/                     # JavaScript
│   │   │   ├── components/         # UI components
│   │   │   │   ├── dashboard.js    # Dashboard logic
│   │   │   │   ├── students.js     # Students logic
│   │   │   │   ├── books.js        # Books logic
│   │   │   │   ├── transactions.js # Transactions logic
│   │   │   │   └── analytics.js    # Analytics logic
│   │   │   │
│   │   │   ├── services/           # Frontend services
│   │   │   │   ├── api.js          # API calls
│   │   │   │   └── notifications.js # Notifications
│   │   │   │
│   │   │   ├── utils/              # Utilities
│   │   │   │   ├── theme.js        # Theme management
│   │   │   │   ├── validation.js   # Input validation
│   │   │   │   └── helpers.js      # Helper functions
│   │   │   │
│   │   │   └── app.js              # Application entry
│   │   │
│   │   └── index.html              # Main HTML file
│   │
│   └── shared/                     # Shared code
│       └── constants.js            # Shared constants
│
├── .gitignore                      # Git ignore file
├── package.json                    # Project metadata
├── package-lock.json               # Locked dependencies
├── LICENSE                         # MIT License
└── README.md                       # This file
```

### Key Directories Explained

- **`build/`** - Icons and resources for building the application
- **`src/main/`** - Backend code (Electron main process)
- **`src/renderer/`** - Frontend code (UI)
- **`src/main/database/`** - All database-related code
- **`src/main/handlers/`** - IPC communication handlers
- **`src/renderer/components/`** - Reusable UI components
- **`src/renderer/css/`** - All styling files organized by purpose

---

## ⚙️ Configuration

### Database Settings

Edit `src/shared/constants.js`:

```javascript
const DATABASE = {
  NAME: "library.db",
  VERSION: 1,
  SAVE_DELAY: 300, // milliseconds
  CACHE_DURATION: 500, // milliseconds
};
```

### Loan Period

Default loan period is 14 days. To change:

```javascript
const TRANSACTION = {
  DEFAULT_LOAN_PERIOD: 14, // days - change this
  MAX_BOOKS_PER_STUDENT: 5,
  RENEWAL_LIMIT: 2,
  OVERDUE_FINE_PER_DAY: 0.5,
};
```

### Application Info

Edit `package.json`:

```json
{
  "name": "library-management-system",
  "version": "1.0.0",
  "description": "Your description",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  }
}
```

### Theme Customization

Edit `src/renderer/css/themes/variables.css`:

```css
:root {
  --color-primary: #6366f1; /* Primary color */
  --color-accent: #ec4899; /* Accent color */
  /* ... more variables ... */
}
```

---

## 🔧 Development

### Running in Development Mode

```bash
npm run dev
```

This will:

- Start the application with developer tools open
- Enable hot reloading
- Show detailed error messages

### Code Structure

The application follows a modular architecture:

1. **Main Process** (`src/main/`)
   - Handles database operations
   - Manages IPC communication
   - Controls application lifecycle

2. **Renderer Process** (`src/renderer/`)
   - Manages UI rendering
   - Handles user interactions
   - Communicates with main process via IPC

3. **Components** (`src/renderer/js/components/`)
   - Each major feature has its own component
   - Components are self-contained and reusable
   - Follow a consistent pattern

### Adding New Features

1. **Create the database model** (if needed)

   ```javascript
   // src/main/database/models/YourModel.js
   class YourModel {
     static create(data) {
       /* ... */
     }
     static findAll() {
       /* ... */
     }
     // ...
   }
   ```

2. **Create IPC handlers**

   ```javascript
   // src/main/handlers/yourHandlers.js
   ipcMain.handle("your-operation", async (event, data) => {
     // Handle the operation
   });
   ```

3. **Create UI component**

   ```javascript
   // src/renderer/js/components/yourComponent.js
   class YourComponent {
     constructor() {
       /* ... */
     }
     async loadData() {
       /* ... */
     }
     render() {
       /* ... */
     }
   }
   ```

4. **Add styles**
   ```css
   /* src/renderer/css/components/yourComponent.css */
   .your-component {
     /* styles */
   }
   ```

### Testing

Currently, the application doesn't have automated tests. Manual testing checklist:

- [ ] Add/edit/delete students
- [ ] Add/edit/delete books
- [ ] Issue books to students
- [ ] Return books
- [ ] Search functionality
- [ ] Analytics display
- [ ] Excel export
- [ ] Theme switching
- [ ] Database backup/restore

---

## 📦 Building

### Build for Current Platform

```bash
npm run build
```

### Build for Specific Platforms

**Windows:**

```bash
npm run build-win
```

**macOS:**

```bash
npm run build-mac
```

**Linux:**

```bash
npm run build-linux
```

**All Platforms:**

```bash
npm run build-all
```

### Build Output

Built applications will be in the `dist/` directory:

- **Windows:** `.exe` installer and portable version
- **macOS:** `.dmg` disk image and `.zip`
- **Linux:** `.AppImage`, `.deb`, and `.rpm` packages

### Distribution

To distribute your application:

1. Build for target platform(s)
2. Test the built application
3. Upload to your distribution channel (website, GitHub releases, etc.)
4. Provide installation instructions for users

### Auto-Updates

The application includes auto-update support using `electron-updater`.

To enable:

1. Set up a GitHub repository
2. Configure `package.json`:
   ```json
   "publish": {
     "provider": "github",
     "owner": "yourusername",
     "repo": "library-management"
   }
   ```
3. Build and publish:
   ```bash
   npm run publish
   ```

---

## 🐛 Troubleshooting

### Application Won't Start

**Problem:** Application crashes on startup

**Solutions:**

- Check if Node.js and npm are properly installed
- Delete `node_modules` and run `npm install` again
- Check console for error messages
- Ensure no other instance is running

### Database Errors

**Problem:** "Database not initialized" error

**Solutions:**

- Check if `library.db` file exists in the app data directory
- Try deleting the database file and restarting (will lose data)
- Check file permissions
- Look for corruption issues

### Search Not Working

**Problem:** Search returns no results

**Solutions:**

- Ensure you have data in the database
- Check if search term is correct
- Clear cache and reload: Ctrl+Shift+R
- Check browser console for JavaScript errors

### Analytics Not Displaying

**Problem:** Analytics modal doesn't open or shows no data

**Solutions:**

- Ensure you have transactions in the database
- Check if analytics.js is properly imported
- Look for console errors
- Verify date filters aren't excluding all data

### Excel Export Fails

**Problem:** Export to Excel doesn't work

**Solutions:**

- Check if you have write permissions
- Ensure ExcelJS is installed: `npm list exceljs`
- Try exporting to a different location
- Check available disk space

### Theme Not Switching

**Problem:** Dark/Light theme toggle doesn't work

**Solutions:**

- Check localStorage in browser dev tools
- Clear cache and reload
- Check if theme.js is loaded
- Verify CSS files are imported correctly

### Build Errors

**Problem:** Build fails with errors

**Solutions:**

- Check if all dependencies are installed
- Update electron-builder: `npm install electron-builder@latest`
- Clear build cache: Delete `dist` folder
- Check `package.json` configuration

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Node version, etc.)

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments where necessary
   - Update documentation if needed
4. **Test your changes**
   - Ensure application still works
   - Test edge cases
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues

### Development Guidelines

- Follow existing code patterns
- Keep components modular and reusable
- Write clear, descriptive comments
- Update README if you add features
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Pradeep Kaliyawansha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See [LICENSE](LICENSE) file for full details.

---

## 📞 Contact

**Author:** Pradeep Kaliyawansha

- **Email:** pradeep@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)
- **Project Link:** [https://github.com/yourusername/library-management](https://github.com/yourusername/library-management)

---

## 🙏 Acknowledgments

- **Electron.js** - For the amazing desktop framework
- **SQL.js** - For bringing SQLite to JavaScript
- **ExcelJS** - For Excel file generation
- **Google Fonts** - For beautiful typography
- **The Open Source Community** - For inspiration and support

---

## 📚 Additional Resources

### Documentation

- [Electron Documentation](https://www.electronjs.org/docs)
- [SQL.js Documentation](https://sql.js.org/)
- [ExcelJS Documentation](https://github.com/exceljs/exceljs)

### Tutorials

- [Electron Quick Start](https://www.electronjs.org/docs/latest/tutorial/quick-start)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [Modern JavaScript](https://javascript.info/)

### Tools

- [Electron Fiddle](https://www.electronjs.org/fiddle) - Experiment with Electron
- [DB Browser for SQLite](https://sqlitebrowser.org/) - View SQLite databases
- [VS Code](https://code.visualstudio.com/) - Recommended editor

---

## 🚀 Roadmap

### Version 1.1 (Planned)

- [ ] User authentication and roles
- [ ] Barcode scanning support
- [ ] Email notifications for overdue books
- [ ] Fine calculation system
- [ ] Book reservation system
- [ ] Advanced search with filters

### Version 2.0 (Future)

- [ ] Cloud synchronization
- [ ] Mobile companion app
- [ ] PDF reports generation
- [ ] Multi-library support
- [ ] Integration with library catalogs
- [ ] Student portal

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/library-management&type=Date)](https://star-history.com/#yourusername/library-management&Date)

---

## 📊 Project Statistics

- **Lines of Code:** ~15,000+
- **Components:** 7 major components
- **Dependencies:** 5 production, 3 development
- **File Size:** ~2MB (packaged)
- **Platforms:** Windows, macOS, Linux
- **License:** MIT

---

<div align="center">

**Made with ❤️ by Pradeep Kaliyawansha**

[⬆ Back to Top](#-library-management-system)

</div>
