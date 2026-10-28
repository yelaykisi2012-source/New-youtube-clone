# Getting Started with Create React App

## Buyurtma, yetkazib berish va to‘lov tizimi (Click, Payme, Naqd pul, Terminal)

Do‘kon React frontend va Node.js API’dan foydalanadi. Quyidagi to‘lov usullari to‘liq ishlaydi:
1. **Click onlayn to‘lov** — Click Upay va Click Evolution orqali to‘lov;
2. **Payme onlayn to‘lov** — Payme tizimi orqali Uzcard va Humo kartalari bilan to‘lov;
3. **Naqd pul orqali to‘lov** — mahsulot yetkazib berilganda kuryerga naqd topshiriladi;
4. **Kuryer terminali (Uzcard/Humo)** — buyurtmani qabul qilishda karta orqali to‘lanadi;
5. **Test / Demo to‘lov rejimi** — sozlamalar kiritilmaganda to‘lov jarayonini birgina tugma bilan sinab ko‘rish mumkin.

API buyurtma ma’lumotlarini SQLite bazasiga saqlaydi, mahsulot narxlarini server katalogidan tekshiradi, Markaziy bankning rasmiy kursi bo‘yicha so‘mga aylantiradi. Standart yetkazib berish narxi: 50 000 so‘m.

### Ishga tushirish:
```powershell
# 1. Muhit parametrlarini o'rnatish
Copy-Item .env.example .env

# 2. Server va frontendni birgalikda ishga tushirish
npm start
```

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
