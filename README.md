# 🏠 RentX 

A **feature-rich rental platform** that allows users to **list, rent, and manage rental requests** seamlessly. This project is built with **Node.js, Express, MongoDB, and EJS**, offering a secure and scalable rental solution.  

---

## 🚀 Features  

### 🔑 Authentication & Authorization  
- **User Registration & Login** (Passport.js authentication)  
- **Session-based authentication**  
- **Role-based access** (Admin, Renter, Owner)  

### 📜 Rental System  
- **List rental items** (owners can add, update, and delete listings)  
- **Rent an item** (users can request rentals with a start & end date)  
- **Availability check** (prevents double bookings)  
- **Booking approval system** (owners can approve/reject requests)  

### 💳 Payment Integration  
- **Multiple payment methods** (`cod`, `razorpay`)  
- **Total price calculation** based on rental duration  

### 🎛️ Admin Panel  
- **Manage users, listings, and rentals**  
- **Track all rental requests and transactions**  

### 📊 Order & History Tracking  
- **View all past and current rentals**  
- **Filter and sort rental requests**  

---

## 🛠️ Tech Stack  

| Technology  | Description  |
|-------------|--------------|
| **Node.js** | Backend runtime  |
| **Express.js** | Web framework for building APIs  |
| **MongoDB** | NoSQL database for storing listings & users  |
| **EJS** | Templating engine for rendering UI  |
| **Passport.js** | Authentication middleware  |
| **Mongoose** | ODM for MongoDB  |
| **Tailwind CSS** | Modern styling framework  |

---

## 📂 Folder Structure  

```
📦 rental-platform
 ┣ 📂 src
 ┃ ┣ 📂 controllers    # Business logic (listing, rent, user controllers)
 ┃ ┣ 📂 models         # Mongoose schemas (User, Listing, Rent)
 ┃ ┣ 📂 routes         # API endpoints for listings & rent system
 ┃ ┣ 📂 views          # EJS templates for rendering UI
 ┃ ┣ 📂 middlewares    # Authentication & validation middlewares
 ┃ ┣ 📂 public         # Static files (CSS, JS, images)
 ┃ ┗ 📂 config         # Database and Passport configuration
 ┣ 📜 .env             # Environment variables
 ┣ 📜 server.js        # Entry point of the application
 ┣ 📜 README.md        # Project documentation
 ┗ 📜 package.json     # Dependencies & scripts
```

---

## ⚡ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-username/rental-platform.git
cd rental-platform
```

### 2️⃣ Install Dependencies  
```bash
npm install
```

### 3️⃣ Set Up Environment Variables  
Create a `.env` file and add the required configurations:  
```ini
MONGO_URI=your_mongodb_connection_string
PORT=8000
SESSION_SECRET=your_secret_key
```

### 4️⃣ Run the Application  
```bash
npm start
```

### 5️⃣ Open in Browser  
Visit [http://localhost:8000](http://localhost:8000)  

---

## 🌐 API Endpoints  

| Method | Endpoint | Description | Auth Required |
|--------|---------|------------|--------------|
| **GET** | `/listings` | Fetch all available listings | No |
| **POST** | `/listings` | Create a new listing | ✅ Yes (Owner) |
| **POST** | `/listings/:id/rent` | Rent an item | ✅ Yes (User) |
| **GET** | `/rent/my` | Get user's rental history | ✅ Yes |
| **PUT** | `/rent/:id/status` | Update rental request status | ✅ Owner/Admin |

---

## 🚀 Future Enhancements  

- ✅ **Implement payment gateway (Razorpay integration)**  
- ✅ **Add search & filter functionality for listings**  
- ✅ **Improve UI/UX with better design & animations**  
- ✅ **Add user reviews & ratings for listings**  
- ✅ **Integrate email notifications for rental approvals**  

---

## 🤝 Contributing  

Contributions are welcome! To contribute:  
1. **Fork** the repository  
2. **Create** a new branch (`feature-branch`)  
3. **Commit** your changes  
4. **Push** the branch  
5. **Open a Pull Request**  

---

## 📜 License  

This project is licensed under the **MIT License**.  

---

## 📩 Contact  

📧 Email: [dipexplorerid23@gmail.com](mailto:dipexplorerid23@gmail.com)  
🔗 GitHub: [dip](https://github.com/dipexplorer)  


📧 Email: [simantasarma79@gmail.com](mailto:simantasarma79@gmail.com)  
🔗 GitHub: [simanta](https://github.com/simantasarma) 
---

### 🔥 Happy Coding! 🚀  
```

### 📌 Steps to Use:
1. **Create a new file** in your project root named `README.md`
2. **Paste** the above content into `README.md`
3. **Replace placeholders** (`your-username`, `your-email@example.com`, `your_mongodb_connection_string`)
4. **Save & push to GitHub!**  

✅ This README is **structured, detailed, and visually appealing**! 🚀 Let me know if you need any modifications.
