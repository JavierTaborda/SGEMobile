# 📱 Frigilux App

<p align="center">
  <img width="900" height="" alt="Phone" src="https://github.com/user-attachments/assets/18208257-67b2-4d67-8000-68def3920f70" />
</p>

<p align="center"> <img src="https://frigilux.com/wp-content/uploads/2024/05/FRIGILUX-LOGO-02-1536x287.png" alt="Frigilux Logo" width="300"/> </p> <p align="center"> <b>Aplicación móvil empresarial para la gestión comercial de Frigilux en Venezuela</b><br/> <i>Enterprise mobile app for commercial management of Frigilux in Venezuela</i> </p> <p align="center"> <a href="https://frigilux.com">🌐 Sitio oficial / Official Website</a> 
   
## 🌟 Características / Features

📊 **Gestión comercial completa** / **Full commercial management**  
Pedidos, ventas y autorización de pagos.  
Orders, sales, and payment authorization.

📲 **Acceso móvil seguro** / **Secure mobile access**  
Múltiples métodos de login: correo, contraseña, OTP, biometría.  
Multiple login methods: email, password, OTP, biometrics.

✅ **Roles y permisos** / **Roles & permissions**  
Admin, gerentes, vendedores.  
Admin, managers, salespeople.

🎨 **UI/UX moderna** / **Modern UI/UX**  
Soporte para tema claro/oscuro, animaciones fluidas y diseño responsive.  
Support for light/dark theme, smooth animations, and responsive design.

🔒 **Seguridad** / **Security**  
Integración con Supabase + autenticación biométrica.  
Integration with Supabase + biometric authentication.




### 🛠 Tecnologías Utilizadas / Tech Stack

| Categoría / Category        | Tecnologías / Technologies                                                                                                                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**                | ![Expo](https://img.shields.io/badge/Expo%20SDK-54-000020?logo=expo\&logoColor=white) ![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react\&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript\&logoColor=white) |
| **Estilos / Styling**       | ![NativeWind](https://img.shields.io/badge/NativeWind-TailwindCSS-38B2AC?logo=tailwind-css\&logoColor=white)                                                                                                                                                                                |
| **Navegación / Navigation** | ![Expo Router](https://img.shields.io/badge/Expo%20Router-File%20Based%20Routing-blue?logo=reactrouter\&logoColor=white)                                                                                                                                                                    |
| **Backend**                 | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs\&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Auth%20+%20DB-3ECF8E?logo=supabase\&logoColor=white)                                                                                                   |
| **Estado / State Mgmt.**    | ![Zustand](https://img.shields.io/badge/Zustand-FF9900?logo=react\&logoColor=white)                                                                                                                                                                                                         |
| **Iconos / Icons**          | ![@expo/vector-icons](https://img.shields.io/badge/%40expo/vector--icons-Icon%20Pack-blueviolet)                                                                                                                                                                                            |
| **Gráficos / Charts**       | ![Chart Kit](https://img.shields.io/badge/react--native--chart--kit-Graphs-orange)                                                                                                                                                                                                          |


### 🏗 Estructura Modular / Modular Architecture
```
frigiluxapp/
├── app/                 # Rutas (Expo Router)/ Routes
├── components/          # Componentes reutilizables / Reusable components
├── modules/             # Módulos de funcionalidad / Feature modules
│   ├── auth/            # Autenticación / Authentication
│   ├── home/            # Dashboard
│   ├── orders/          # Gestión de pedidos / Order management
│   ├── pays/            # Autorización de pagos / Payments
│   └── profile/         # Perfil de usuario / User profile
├── stores/              # Estado global (Zustand) / Global state
├── utils/               # Utilidades y helpers / Utilities
└── lib/                 # Configuraciones externas / External configs
```


### 📸 Demo / Screenshots


<p align="center">
<img src="https://github.com/user-attachments/assets/8dd1265d-f379-4712-a22e-258202a54141" alt="Login" width="200" style="margin: 10px;" />
  <br><em>✔ Login</em>
</p>


<p align="center">
<img src="https://github.com/user-attachments/assets/ca5d9116-5414-48ee-bc5b-8ae82b742da3" alt="Login" width="200" style="margin: 10px;" />
  <br><em>📲 Home </em>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/842842f4-4e8b-4f49-a85e-678ca7aabe40" alt="Drawer" width="200" style="margin: 10px;" />
  <br><em>📂 Drawer Menu</em>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/adc9a11c-e09a-4fa0-8545-38799a7d5228" alt="Order Approval 1" width="200" style="margin: 10px;" />
  <img src="https://github.com/user-attachments/assets/0027a03a-62ae-4787-b0e6-1c8468d23209" alt="Order Approval 2" width="200" style="margin: 10px;" /> 
  <img src="https://github.com/user-attachments/assets/e5e06dde-9dd2-400c-b435-cfb4c03cd1cb" alt="Order Approval 3" width="200" style="margin: 10px;" />
  <img src="https://github.com/user-attachments/assets/6face753-311f-49e2-8718-1adb162cdbc5" alt="Order Approval 4" width="200" style="margin: 10px;" />
  <img src="https://github.com/user-attachments/assets/2ab66e71-33d4-427e-b607-cbd47b996ff2" alt="Order Approval 5" width="200" style="margin: 10px;" />
  <br><em>✅ Orders Screens: Approval Orders, Details Order, Filters and Searchs </em>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/99d86828-512a-424e-bcc4-1af6c4d06146" alt="Create Order" width="200" style="margin: 10px;" />
  <br><em>📝 Create Order Screen</em>
</p>

