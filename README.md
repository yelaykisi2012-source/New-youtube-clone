# Getting Started with Create React App

## YouTube Data API v3 sozlamalari

Ilova bosh sahifada ommabop videolarni ko‘rsatadi, YouTube Data API orqali video qidiradi va musiqa, o‘yinlar, yangiliklar, sport, ta’lim hamda jonli efir kategoriyalarini taklif qiladi. Shorts bo‘limi YouTube qidiruvida `#shorts` tegi va qisqa davomiylik filtri bilan videolarni topadi; API alohida Shorts endpoint bermagani sababli natijalar barcha Shorts videolarini kafolatlamaydi. Qidiruv natijalarida o‘zbek tiliga ustuvorlik beriladi; API til bo‘yicha qat’iy filtr bermagani uchun boshqa tillardagi videolar ham uchrashi mumkin. Tarix, keyinroq ko‘rish, yoqtirilganlar va obunalar brauzerda saqlanadi. Admin panel orqali qo‘shilgan video havolalari va profil rasmi ham faqat joriy brauzerda saqlanadi.

1. Google Cloud Console’da loyiha yarating, **YouTube Data API v3** ni yoqing va API kaliti yarating.
2. Loyiha ildizidagi `.env` fayliga quyidagi qiymatni qo‘shing:

   ```env
   REACT_APP_YOUTUBE_API_KEY=kalitingiz
   ```

3. Ishlayotgan `npm start` jarayonini qayta ishga tushiring.

Brauzerda ishlaydigan React ilovasida API kaliti foydalanuvchilarga ko‘rinadi. Google Cloud Console’da kalitni HTTP referrerlar bilan cheklang va faqat YouTube Data API v3 uchun ruxsat bering. API kalitini ommaviy repozitoriyga yuklamang.

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
