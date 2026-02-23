# LEGADO & CO — API Documentation

**Base URL:** `https://legadoandco.com/api_backend`  
**Version:** 1.0  
**Last Updated:** February 17, 2026  
**Content Type:** `application/json` (unless uploading files — use `multipart/form-data`)

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Auth APIs](#2-auth-apis)
   - 2.1 Register
   - 2.2 Verify OTP
   - 2.3 Resend OTP
   - 2.4 Login
   - 2.5 Logout
   - 2.6 Get Current User
3. [Product APIs](#3-product-apis)
   - 3.1 List Products
   - 3.2 Get Product by ID
   - 3.3 Create Product
   - 3.4 Update Product
   - 3.5 Delete Product
   - 3.6 Restore Product
4. [Category APIs](#4-category-apis)
   - 4.1 List Categories
   - 4.2 Create Category
   - 4.3 Update Category
   - 4.4 Delete Category
   - 4.5 Restore Category
5. [Cart APIs](#5-cart-apis)
   - 5.1 Get Cart
   - 5.2 Add to Cart
   - 5.3 Update Cart Item
   - 5.4 Remove Cart Item
   - 5.5 Restore Cart Item
   - 5.6 Checkout
6. [Order APIs](#6-order-apis)
   - 6.1 List Orders
   - 6.2 Get Order by ID
7. [Address APIs](#7-address-apis)
   - 7.1 List Addresses
   - 7.2 Create Address
   - 7.3 Update Address
   - 7.4 Delete Address
   - 7.5 Restore Address
8. [Coupon APIs](#8-coupon-apis)
   - 8.1 List Coupons
   - 8.2 Get Coupon by ID
   - 8.3 Create Coupon
   - 8.4 Update Coupon
   - 8.5 Delete Coupon
9. [Carousel APIs](#9-carousel-apis)
   - 9.1 List Carousel Items
   - 9.2 Create Carousel Item
   - 9.3 Update Carousel Item
   - 9.4 Delete Carousel Item
10. [Featured Products APIs](#10-featured-products-apis)
    - 10.1 List Featured Products
    - 10.2 Create Featured Product
    - 10.3 Update Featured Product
    - 10.4 Delete Featured Product
11. [Data Models Reference](#11-data-models-reference)
12. [Error Handling](#12-error-handling)

---

## 1. Authentication & Authorization

All protected endpoints require a **Bearer Token** in the `Authorization` header.

```
Authorization: Bearer <token>
```

### How it works

- An **AuthInterceptor** automatically attaches the token stored in `localStorage` to every outgoing HTTP request.
- If the server returns a **401 Unauthorized** response, the interceptor clears the stored auth data and redirects:
  - Admin routes → `/admin/login`
  - Customer routes → `/login`

### Token Storage

| Key                  | Storage     | Description               |
|----------------------|-------------|---------------------------|
| `legado_auth_token`  | localStorage | Bearer authentication token |
| `legado_auth_user`   | localStorage | Serialized user JSON object |

---

## 2. Auth APIs

### 2.1 Register

Creates a new user account.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/register`                  |
| **Auth**    | Not required                 |

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "message": "Registration successful. Please verify your email with the OTP sent.",
  "email": "john@example.com"
}
```

**Error Response (422):**

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

### 2.2 Verify OTP

Verifies the OTP sent to the user's email after registration.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/verify-otp`                |
| **Auth**    | Not required                 |

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**

```json
{
  "message": "Email verified successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "is_admin": false,
    "created_at": "2026-02-17T10:00:00.000Z",
    "updated_at": "2026-02-17T10:00:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "message": "Invalid or expired OTP."
}
```

---

### 2.3 Resend OTP

Resends the OTP to the user's email.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/resend-otp`                |
| **Auth**    | Not required                 |

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "OTP has been resent to your email."
}
```

**Error Response (404):**

```json
{
  "message": "No account found with this email."
}
```

---

### 2.4 Login

Authenticates a user and returns a bearer token.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/login`                     |
| **Auth**    | Not required                 |

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "is_admin": false,
    "addresses": [],
    "created_at": "2026-02-17T10:00:00.000Z",
    "updated_at": "2026-02-17T10:00:00.000Z"
  }
}
```

**Error Response (401):**

```json
{
  "message": "Invalid email or password."
}
```

---

### 2.5 Logout

Invalidates the current user's token.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/logout`                    |
| **Auth**    | **Required** (Bearer Token)  |

**Request Body:** _(empty)_

```json
{}
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "message": "Logged out successfully."
}
```

---

### 2.6 Get Current User

Retrieves the profile of the currently authenticated user.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/me`                        |
| **Auth**    | **Required** (Bearer Token)  |

**Request Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "is_admin": false,
  "addresses": [
    {
      "id": 1,
      "type": "shipping",
      "street": "123 Main Street",
      "location": "Downtown",
      "landmark": "Near Central Park",
      "pincode": "500001",
      "state": "Telangana",
      "city": "Hyderabad"
    }
  ],
  "created_at": "2026-02-17T10:00:00.000Z",
  "updated_at": "2026-02-17T10:00:00.000Z"
}
```

**Error Response (401):**

```json
{
  "message": "Unauthenticated."
}
```

---

## 3. Product APIs

### 3.1 List Products

Retrieves a paginated list of products with optional filtering.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/products`                  |
| **Auth**    | **Required** (Bearer Token)  |

**Query Parameters:**

| Parameter     | Type    | Required | Description                          |
|---------------|---------|----------|--------------------------------------|
| `page`        | number  | No       | Page number (default: 1)             |
| `per_page`    | number  | No       | Items per page (default: 15)         |
| `search`      | string  | No       | Search by product name               |
| `category`    | string  | No       | Filter by category slug              |
| `is_active`   | boolean | No       | Filter by active status              |
| `is_on_sale`  | boolean | No       | Filter by sale status                |

**Example Request:**

```
GET /products?page=1&per_page=10&category=mens&is_active=true
```

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Classic White Shirt",
      "description": "Premium cotton white shirt for men",
      "price": 2499.00,
      "original_price": 3499.00,
      "is_on_sale": true,
      "discount_percentage": 28,
      "is_active": true,
      "category": "mens",
      "images": [
        "https://legadoandco.com/storage/products/shirt1.jpg",
        "https://legadoandco.com/storage/products/shirt2.jpg"
      ],
      "inStock": true,
      "stockQuantity": 50,
      "attributes": [
        { "name": "Size", "value": "S, M, L, XL" },
        { "name": "Color", "value": "White" }
      ],
      "tags": ["formal", "cotton", "bestseller"],
      "featured": true,
      "badge": "New Arrival",
      "rating": 4.5,
      "reviewCount": 120
    }
  ],
  "total": 85,
  "per_page": 10,
  "current_page": 1
}
```

---

### 3.2 Get Product by ID

Retrieves a single product by its ID.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/products/{id}`             |
| **Auth**    | **Required** (Bearer Token)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The product ID      |

**Success Response (200):**

```json
{
  "id": "1",
  "name": "Classic White Shirt",
  "description": "Premium cotton white shirt for men",
  "price": 2499.00,
  "original_price": 3499.00,
  "is_on_sale": true,
  "discount_percentage": 28,
  "is_active": true,
  "category": "mens",
  "images": [
    "https://legadoandco.com/storage/products/shirt1.jpg",
    "https://legadoandco.com/storage/products/shirt2.jpg"
  ],
  "inStock": true,
  "stockQuantity": 50,
  "attributes": [
    { "name": "Size", "value": "S, M, L, XL" },
    { "name": "Color", "value": "White" }
  ],
  "tags": ["formal", "cotton", "bestseller"],
  "featured": true,
  "badge": "New Arrival",
  "rating": 4.5,
  "reviewCount": 120
}
```

**Error Response (404):**

```json
{
  "message": "Product not found."
}
```

---

### 3.3 Create Product

Creates a new product. Supports `multipart/form-data` for image uploads.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `POST`                                   |
| **URL**     | `/products`                              |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Request Body (JSON):**

```json
{
  "name": "Classic White Shirt",
  "description": "Premium cotton white shirt for men",
  "price": 2499.00,
  "original_price": 3499.00,
  "is_on_sale": true,
  "discount_percentage": 28,
  "is_active": true,
  "category": "mens",
  "inStock": true,
  "stockQuantity": 50,
  "attributes": [
    { "name": "Size", "value": "S, M, L, XL" },
    { "name": "Color", "value": "White" }
  ],
  "tags": ["formal", "cotton"],
  "featured": false,
  "badge": "New Arrival"
}
```

**Request Body (FormData — for image uploads):**

| Field              | Type     | Description                    |
|--------------------|----------|--------------------------------|
| `name`             | string   | Product name                   |
| `description`      | string   | Product description            |
| `price`            | number   | Selling price                  |
| `original_price`   | number   | Original MRP price             |
| `category`         | string   | Category slug                  |
| `is_active`        | boolean  | Active status                  |
| `images[]`         | File[]   | Product image files            |
| `stockQuantity`    | number   | Stock quantity                 |

**Success Response (201):**

```json
{
  "id": "2",
  "name": "Classic White Shirt",
  "message": "Product created successfully."
}
```

**Error Response (422):**

```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "price": ["The price must be a number."]
  }
}
```

---

### 3.4 Update Product

Updates an existing product. Supports `multipart/form-data` for image uploads.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `PUT`                                    |
| **URL**     | `/products/{id}`                         |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The product ID      |

**Request Body:** _(Same structure as Create — only include fields being updated)_

```json
{
  "price": 1999.00,
  "is_on_sale": true,
  "discount_percentage": 43
}
```

**Success Response (200):**

```json
{
  "id": "2",
  "name": "Classic White Shirt",
  "message": "Product updated successfully."
}
```

---

### 3.5 Delete Product

Soft-deletes a product.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `DELETE`                                 |
| **URL**     | `/products/{id}`                         |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The product ID      |

**Success Response (200):**

```json
{
  "message": "Product deleted successfully."
}
```

---

### 3.6 Restore Product

Restores a previously soft-deleted product.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `POST`                                   |
| **URL**     | `/products/{id}/restore`                 |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The product ID      |

**Request Body:** _(empty)_

```json
{}
```

**Success Response (200):**

```json
{
  "message": "Product restored successfully."
}
```

---

## 4. Category APIs

### 4.1 List Categories

Retrieves a paginated list of categories.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/categories`                |
| **Auth**    | **Required** (Bearer Token)  |

**Query Parameters:**

| Parameter   | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `page`      | number  | No       | Page number (default: 1)             |
| `per_page`  | number  | No       | Items per page (default: 15)         |
| `search`    | string  | No       | Search by category name              |
| `is_active` | boolean | No       | Filter by active status              |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Men's Collection",
      "slug": "mens-collection",
      "description": "Premium men's fashion collection",
      "image_url": "https://legadoandco.com/storage/categories/mens.jpg",
      "parent_id": null,
      "is_active": true,
      "deleted_at": null,
      "created_at": "2026-01-15T08:30:00.000Z",
      "updated_at": "2026-02-10T14:20:00.000Z"
    }
  ],
  "total": 12,
  "per_page": 15,
  "current_page": 1
}
```

---

### 4.2 Create Category

Creates a new category. Supports `multipart/form-data` for image uploads.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `POST`                                   |
| **URL**     | `/categories`                            |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Request Body (JSON):**

```json
{
  "name": "Men's Collection",
  "description": "Premium men's fashion collection",
  "parent_id": null,
  "is_active": true
}
```

**Request Body (FormData):**

| Field         | Type    | Description                    |
|---------------|---------|--------------------------------|
| `name`        | string  | Category name (required)       |
| `description` | string  | Category description           |
| `parent_id`   | number  | Parent category ID (nullable)  |
| `is_active`   | boolean | Active status                  |
| `image`       | File    | Category image file            |

**Success Response (201):**

```json
{
  "id": 2,
  "name": "Men's Collection",
  "slug": "mens-collection",
  "description": "Premium men's fashion collection",
  "image_url": "https://legadoandco.com/storage/categories/mens.jpg",
  "parent_id": null,
  "is_active": true,
  "created_at": "2026-02-17T10:00:00.000Z",
  "updated_at": "2026-02-17T10:00:00.000Z"
}
```

---

### 4.3 Update Category

Updates an existing category.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `PUT`                                    |
| **URL**     | `/categories/{id}`                       |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The category ID     |

**Request Body:** _(Only include fields being updated)_

```json
{
  "name": "Updated Collection Name",
  "is_active": false
}
```

**Success Response (200):**

```json
{
  "id": 2,
  "name": "Updated Collection Name",
  "slug": "updated-collection-name",
  "is_active": false,
  "updated_at": "2026-02-17T12:00:00.000Z"
}
```

---

### 4.4 Delete Category

Soft-deletes a category.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `DELETE`                                 |
| **URL**     | `/categories/{id}`                       |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Success Response (200):**

```json
{
  "message": "Category deleted successfully."
}
```

---

### 4.5 Restore Category

Restores a previously soft-deleted category.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `POST`                                   |
| **URL**     | `/categories/{id}/restore`               |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Request Body:** _(empty)_

```json
{}
```

**Success Response (200):**

```json
{
  "message": "Category restored successfully."
}
```

---

## 5. Cart APIs

### 5.1 Get Cart

Retrieves all items in the current user's cart.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/cart`                      |
| **Auth**    | **Required** (Bearer Token)  |

**Success Response (200):**

```json
{
  "items": [
    {
      "id": 1,
      "product": {
        "id": "1",
        "name": "Classic White Shirt",
        "price": 2499.00,
        "images": ["https://legadoandco.com/storage/products/shirt1.jpg"]
      },
      "quantity": 2,
      "selectedSize": "L",
      "selectedColor": "White"
    }
  ],
  "total": 4998.00,
  "item_count": 2
}
```

---

### 5.2 Add to Cart

Adds a product to the user's cart.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/cart/add`                  |
| **Auth**    | **Required** (Bearer Token)  |

**Request Body:**

```json
{
  "product_id": "1",
  "quantity": 2,
  "selectedSize": "L",
  "selectedColor": "White"
}
```

**Success Response (200):**

```json
{
  "message": "Item added to cart.",
  "cart_item": {
    "id": 1,
    "product_id": "1",
    "quantity": 2,
    "selectedSize": "L",
    "selectedColor": "White"
  }
}
```

**Error Response (400):**

```json
{
  "message": "Product is out of stock."
}
```

---

### 5.3 Update Cart Item

Updates the quantity or options of a cart item.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `PUT`                        |
| **URL**     | `/cart/{itemId}`             |
| **Auth**    | **Required** (Bearer Token)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `itemId`  | number/string | Yes      | The cart item ID    |

**Request Body:**

```json
{
  "quantity": 3
}
```

**Success Response (200):**

```json
{
  "message": "Cart item updated.",
  "cart_item": {
    "id": 1,
    "quantity": 3
  }
}
```

---

### 5.4 Remove Cart Item

Removes an item from the cart.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `DELETE`                     |
| **URL**     | `/cart/{itemId}`             |
| **Auth**    | **Required** (Bearer Token)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `itemId`  | number/string | Yes      | The cart item ID    |

**Success Response (200):**

```json
{
  "message": "Item removed from cart."
}
```

---

### 5.5 Restore Cart Item

Restores a previously removed cart item.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/cart/{itemId}/restore`     |
| **Auth**    | **Required** (Bearer Token)  |

**Request Body:** _(empty)_

```json
{}
```

**Success Response (200):**

```json
{
  "message": "Cart item restored."
}
```

---

### 5.6 Checkout

Processes the cart checkout and creates an order.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/cart/checkout`             |
| **Auth**    | **Required** (Bearer Token)  |

**Request Body:**

```json
{
  "shipping_address_id": 1,
  "billing_address_id": 2,
  "coupon_code": "SAVE20",
  "payment_method": "online",
  "notes": "Please deliver before 5 PM"
}
```

**Success Response (200):**

```json
{
  "message": "Order placed successfully.",
  "order_id": 101,
  "total": 3998.00,
  "discount": 799.60,
  "grand_total": 3198.40,
  "payment_url": "https://payment-gateway.com/pay/xyz123"
}
```

**Error Response (400):**

```json
{
  "message": "Your cart is empty."
}
```

---

## 6. Order APIs

### 6.1 List Orders

Retrieves a paginated list of the user's orders.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/orders`                    |
| **Auth**    | **Required** (Bearer Token)  |

**Query Parameters:**

| Parameter   | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `page`      | number  | No       | Page number (default: 1)             |
| `per_page`  | number  | No       | Items per page (default: 15)         |
| `status`    | string  | No       | Filter by order status               |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 101,
      "status": "confirmed",
      "total": 4998.00,
      "discount": 0,
      "grand_total": 4998.00,
      "item_count": 2,
      "payment_method": "online",
      "payment_status": "paid",
      "created_at": "2026-02-17T10:30:00.000Z",
      "updated_at": "2026-02-17T10:35:00.000Z"
    }
  ],
  "total": 5,
  "per_page": 15,
  "current_page": 1
}
```

---

### 6.2 Get Order by ID

Retrieves full details of a specific order.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/orders/{id}`               |
| **Auth**    | **Required** (Bearer Token)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The order ID        |

**Success Response (200):**

```json
{
  "id": 101,
  "status": "confirmed",
  "total": 4998.00,
  "discount": 0,
  "grand_total": 4998.00,
  "payment_method": "online",
  "payment_status": "paid",
  "notes": "Please deliver before 5 PM",
  "items": [
    {
      "product_id": "1",
      "product_name": "Classic White Shirt",
      "quantity": 2,
      "price": 2499.00,
      "selectedSize": "L",
      "selectedColor": "White"
    }
  ],
  "shipping_address": {
    "id": 1,
    "type": "shipping",
    "street": "123 Main Street",
    "location": "Downtown",
    "landmark": "Near Central Park",
    "pincode": "500001",
    "state": "Telangana",
    "city": "Hyderabad"
  },
  "billing_address": {
    "id": 2,
    "type": "billing",
    "street": "456 Business Ave",
    "location": "Tech Park",
    "landmark": "Opposite Mall",
    "pincode": "500081",
    "state": "Telangana",
    "city": "Hyderabad"
  },
  "created_at": "2026-02-17T10:30:00.000Z",
  "updated_at": "2026-02-17T10:35:00.000Z"
}
```

**Error Response (404):**

```json
{
  "message": "Order not found."
}
```

---

## 7. Address APIs

### 7.1 List Addresses

Retrieves all saved addresses for the current user.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/addresses`                 |
| **Auth**    | **Required** (Bearer Token)  |

**Query Parameters:**

| Parameter   | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `per_page`  | number  | No       | Items per page                       |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "type": "shipping",
      "street": "123 Main Street",
      "location": "Downtown",
      "landmark": "Near Central Park",
      "pincode": "500001",
      "state": "Telangana",
      "city": "Hyderabad"
    },
    {
      "id": 2,
      "type": "billing",
      "street": "456 Business Ave",
      "location": "Tech Park",
      "landmark": "Opposite Mall",
      "pincode": "500081",
      "state": "Telangana",
      "city": "Hyderabad"
    }
  ]
}
```

---

### 7.2 Create Address

Creates a new address for the current user.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/addresses`                 |
| **Auth**    | **Required** (Bearer Token)  |

**Request Body:**

```json
{
  "type": "shipping",
  "street": "789 Oak Lane",
  "location": "Green Valley",
  "landmark": "Next to Library",
  "pincode": "500032",
  "state": "Telangana",
  "city": "Hyderabad"
}
```

**Success Response (201):**

```json
{
  "id": 3,
  "type": "shipping",
  "street": "789 Oak Lane",
  "location": "Green Valley",
  "landmark": "Next to Library",
  "pincode": "500032",
  "state": "Telangana",
  "city": "Hyderabad"
}
```

**Error Response (422):**

```json
{
  "message": "Validation failed",
  "errors": {
    "street": ["The street field is required."],
    "pincode": ["The pincode must be 6 digits."]
  }
}
```

---

### 7.3 Update Address

Updates an existing address.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `PUT`                        |
| **URL**     | `/addresses/{id}`            |
| **Auth**    | **Required** (Bearer Token)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The address ID      |

**Request Body:** _(Only include fields being updated)_

```json
{
  "street": "Updated Street Name",
  "pincode": "500045"
}
```

**Success Response (200):**

```json
{
  "id": 3,
  "type": "shipping",
  "street": "Updated Street Name",
  "pincode": "500045",
  "state": "Telangana",
  "city": "Hyderabad"
}
```

---

### 7.4 Delete Address

Soft-deletes an address.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `DELETE`                     |
| **URL**     | `/addresses/{id}`            |
| **Auth**    | **Required** (Bearer Token)  |

**Success Response (200):**

```json
{
  "message": "Address deleted successfully."
}
```

---

### 7.5 Restore Address

Restores a previously soft-deleted address.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `POST`                       |
| **URL**     | `/addresses/{id}/restore`    |
| **Auth**    | **Required** (Bearer Token)  |

**Request Body:** _(empty)_

```json
{}
```

**Success Response (200):**

```json
{
  "message": "Address restored successfully."
}
```

---

## 8. Coupon APIs

### 8.1 List Coupons

Retrieves all available coupons.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `GET`                                    |
| **URL**     | `/coupons`                               |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Query Parameters:**

| Parameter   | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `page`      | number  | No       | Page number                          |
| `per_page`  | number  | No       | Items per page                       |
| `is_active` | boolean | No       | Filter by active status              |

**Success Response (200):**

```json
[
  {
    "id": 1,
    "code": "SAVE20",
    "description": "Get 20% off on your next order",
    "discount_type": "percentage",
    "discount_value": 20,
    "usage_limit": 100,
    "used_count": 45,
    "valid_from": "2026-01-01T00:00:00.000Z",
    "valid_until": "2026-12-31T23:59:59.000Z",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-02-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "code": "FLAT500",
    "description": "Flat Rs.500 off on orders above Rs.2000",
    "discount_type": "fixed",
    "discount_value": 500,
    "usage_limit": 50,
    "used_count": 12,
    "valid_from": "2026-02-01T00:00:00.000Z",
    "valid_until": "2026-03-31T23:59:59.000Z",
    "is_active": true,
    "created_at": "2026-02-01T00:00:00.000Z",
    "updated_at": "2026-02-01T00:00:00.000Z"
  }
]
```

---

### 8.2 Get Coupon by ID

Retrieves details of a specific coupon.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `GET`                                    |
| **URL**     | `/coupons/{id}`                          |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Path Parameters:**

| Parameter | Type          | Required | Description         |
|-----------|---------------|----------|---------------------|
| `id`      | number/string | Yes      | The coupon ID       |

**Success Response (200):**

```json
{
  "id": 1,
  "code": "SAVE20",
  "description": "Get 20% off on your next order",
  "discount_type": "percentage",
  "discount_value": 20,
  "usage_limit": 100,
  "used_count": 45,
  "valid_from": "2026-01-01T00:00:00.000Z",
  "valid_until": "2026-12-31T23:59:59.000Z",
  "is_active": true,
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-02-15T10:00:00.000Z"
}
```

---

### 8.3 Create Coupon

Creates a new coupon.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `POST`                                   |
| **URL**     | `/coupons`                               |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Request Body:**

```json
{
  "code": "SUMMER30",
  "description": "Summer sale - 30% off",
  "discount_type": "percentage",
  "discount_value": 30,
  "usage_limit": 200,
  "valid_from": "2026-04-01T00:00:00.000Z",
  "valid_until": "2026-06-30T23:59:59.000Z",
  "is_active": true
}
```

**Field Definitions:**

| Field            | Type    | Required | Description                                  |
|------------------|---------|----------|----------------------------------------------|
| `code`           | string  | Yes      | Unique coupon code                           |
| `description`    | string  | No       | Human-readable description                   |
| `discount_type`  | string  | Yes      | Either `"percentage"` or `"fixed"`           |
| `discount_value` | number  | Yes      | Discount amount (% or flat value)            |
| `usage_limit`    | number  | No       | Max number of times coupon can be used       |
| `valid_from`     | string  | No       | Start date (ISO 8601)                        |
| `valid_until`    | string  | No       | Expiry date (ISO 8601)                       |
| `is_active`      | boolean | No       | Whether the coupon is active (default: true) |

**Success Response (201):**

```json
{
  "id": 3,
  "code": "SUMMER30",
  "description": "Summer sale - 30% off",
  "discount_type": "percentage",
  "discount_value": 30,
  "usage_limit": 200,
  "used_count": 0,
  "valid_from": "2026-04-01T00:00:00.000Z",
  "valid_until": "2026-06-30T23:59:59.000Z",
  "is_active": true,
  "created_at": "2026-02-17T10:00:00.000Z",
  "updated_at": "2026-02-17T10:00:00.000Z"
}
```

---

### 8.4 Update Coupon

Updates an existing coupon.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `PUT`                                    |
| **URL**     | `/coupons/{id}`                          |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Request Body:** _(Only include fields being updated)_

```json
{
  "discount_value": 35,
  "is_active": false
}
```

**Success Response (200):**

```json
{
  "id": 3,
  "code": "SUMMER30",
  "discount_value": 35,
  "is_active": false,
  "updated_at": "2026-02-17T12:00:00.000Z"
}
```

---

### 8.5 Delete Coupon

Permanently deletes a coupon.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `DELETE`                                 |
| **URL**     | `/coupons/{id}`                          |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Success Response (200):**

```json
{
  "message": "Coupon deleted successfully."
}
```

---

## 9. Carousel APIs

### 9.1 List Carousel Items

Retrieves all homepage carousel/banner items.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/carousel`                  |
| **Auth**    | **Required** (Bearer Token)  |

**Success Response (200):**

```json
[
  {
    "id": 1,
    "image_url": "https://legadoandco.com/storage/carousel/banner1.jpg",
    "title": "Summer Collection 2026",
    "description": "Discover the latest trends in summer fashion",
    "link": "/collections/summer-2026",
    "order": 1,
    "created_at": "2026-01-15T08:00:00.000Z",
    "updated_at": "2026-02-10T10:00:00.000Z"
  },
  {
    "id": 2,
    "image_url": "https://legadoandco.com/storage/carousel/banner2.jpg",
    "title": "Flat 40% Off",
    "description": "End of season sale on all products",
    "link": "/sale",
    "order": 2,
    "created_at": "2026-02-01T08:00:00.000Z",
    "updated_at": "2026-02-01T08:00:00.000Z"
  }
]
```

---

### 9.2 Create Carousel Item

Creates a new carousel/banner item. Supports image upload via FormData.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `POST`                                   |
| **URL**     | `/carousel`                              |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Request Body (FormData):**

| Field         | Type   | Required | Description                  |
|---------------|--------|----------|------------------------------|
| `title`       | string | No       | Banner title                 |
| `description` | string | No       | Banner description           |
| `link`        | string | No       | Click-through URL            |
| `order`       | number | No       | Display order (sort position)|
| `image`       | File   | No       | Banner image file            |

**Request Body (JSON):**

```json
{
  "title": "New Arrivals",
  "description": "Check out our latest collection",
  "link": "/new-arrivals",
  "order": 3
}
```

**Success Response (201):**

```json
{
  "id": 3,
  "image_url": "https://legadoandco.com/storage/carousel/banner3.jpg",
  "title": "New Arrivals",
  "description": "Check out our latest collection",
  "link": "/new-arrivals",
  "order": 3,
  "created_at": "2026-02-17T10:00:00.000Z",
  "updated_at": "2026-02-17T10:00:00.000Z"
}
```

---

### 9.3 Update Carousel Item

Updates an existing carousel item.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `PUT`                                    |
| **URL**     | `/carousel/{id}`                         |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Path Parameters:**

| Parameter | Type          | Required | Description             |
|-----------|---------------|----------|-------------------------|
| `id`      | number/string | Yes      | The carousel item ID    |

**Request Body:** _(Only include fields being updated)_

```json
{
  "title": "Updated Banner Title",
  "order": 1
}
```

**Success Response (200):**

```json
{
  "id": 3,
  "title": "Updated Banner Title",
  "order": 1,
  "updated_at": "2026-02-17T12:00:00.000Z"
}
```

---

### 9.4 Delete Carousel Item

Permanently deletes a carousel item.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `DELETE`                                 |
| **URL**     | `/carousel/{id}`                         |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Success Response (200):**

```json
{
  "message": "Carousel item deleted successfully."
}
```

---

## 10. Featured Products APIs

### 10.1 List Featured Products

Retrieves all featured products displayed on the homepage.

| Property    | Value                        |
|-------------|------------------------------|
| **Method**  | `GET`                        |
| **URL**     | `/featured-products`         |
| **Auth**    | **Required** (Bearer Token)  |

**Success Response (200):**

```json
[
  {
    "id": 1,
    "product_id": "5",
    "name": "Premium Leather Jacket",
    "price": 7999.00,
    "description": "Handcrafted genuine leather jacket",
    "image_url": "https://legadoandco.com/storage/featured/jacket1.jpg",
    "order": 1,
    "created_at": "2026-01-20T08:00:00.000Z",
    "updated_at": "2026-02-10T10:00:00.000Z"
  },
  {
    "id": 2,
    "product_id": "12",
    "name": "Silk Saree Collection",
    "price": 5499.00,
    "description": "Elegant handwoven silk sarees",
    "image_url": "https://legadoandco.com/storage/featured/saree1.jpg",
    "order": 2,
    "created_at": "2026-02-01T08:00:00.000Z",
    "updated_at": "2026-02-01T08:00:00.000Z"
  }
]
```

---

### 10.2 Create Featured Product

Adds a product to the featured products section. Supports image upload.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `POST`                                   |
| **URL**     | `/featured-products`                     |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Request Body (FormData):**

| Field         | Type          | Required | Description                    |
|---------------|---------------|----------|--------------------------------|
| `product_id`  | number/string | No       | ID of the product to feature   |
| `name`        | string        | No       | Display name override          |
| `price`       | number        | No       | Display price override         |
| `description` | string        | No       | Display description override   |
| `order`       | number        | No       | Display order (sort position)  |
| `image`       | File          | No       | Featured image file            |

**Request Body (JSON):**

```json
{
  "product_id": "8",
  "name": "Designer Watch",
  "price": 12999.00,
  "description": "Swiss-made luxury designer watch",
  "order": 3
}
```

**Success Response (201):**

```json
{
  "id": 3,
  "product_id": "8",
  "name": "Designer Watch",
  "price": 12999.00,
  "description": "Swiss-made luxury designer watch",
  "image_url": "https://legadoandco.com/storage/featured/watch1.jpg",
  "order": 3,
  "created_at": "2026-02-17T10:00:00.000Z",
  "updated_at": "2026-02-17T10:00:00.000Z"
}
```

---

### 10.3 Update Featured Product

Updates a featured product entry.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `PUT`                                    |
| **URL**     | `/featured-products/{id}`                |
| **Auth**    | **Required** (Bearer Token, Admin only)  |
| **Content** | `application/json` or `multipart/form-data` |

**Path Parameters:**

| Parameter | Type          | Required | Description                |
|-----------|---------------|----------|----------------------------|
| `id`      | number/string | Yes      | The featured product ID    |

**Request Body:** _(Only include fields being updated)_

```json
{
  "order": 1,
  "price": 10999.00
}
```

**Success Response (200):**

```json
{
  "id": 3,
  "name": "Designer Watch",
  "price": 10999.00,
  "order": 1,
  "updated_at": "2026-02-17T12:00:00.000Z"
}
```

---

### 10.4 Delete Featured Product

Removes a product from the featured products section.

| Property    | Value                                    |
|-------------|------------------------------------------|
| **Method**  | `DELETE`                                 |
| **URL**     | `/featured-products/{id}`                |
| **Auth**    | **Required** (Bearer Token, Admin only)  |

**Success Response (200):**

```json
{
  "message": "Featured product removed successfully."
}
```

---

## 11. Data Models Reference

### User

```json
{
  "id": "number | string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "is_admin": "boolean",
  "addresses": "Address[]",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Address

```json
{
  "id": "number | string",
  "type": "'billing' | 'shipping'",
  "street": "string",
  "location": "string",
  "landmark": "string",
  "pincode": "string",
  "state": "string",
  "city": "string"
}
```

### AuthResponse

```json
{
  "token": "string (JWT)",
  "token_type": "string (e.g. 'Bearer')",
  "expires_in": "number (seconds)",
  "user": "User object"
}
```

### Product

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "original_price": "number",
  "is_on_sale": "boolean",
  "discount_percentage": "number",
  "is_active": "boolean",
  "category": "'mens' | 'womens' | 'collections'",
  "images": "string[] (URLs)",
  "inStock": "boolean",
  "stockQuantity": "number",
  "attributes": "ProductAttribute[]",
  "tags": "string[]",
  "featured": "boolean",
  "badge": "string",
  "rating": "number",
  "reviewCount": "number"
}
```

### ProductAttribute

```json
{
  "name": "string",
  "value": "string"
}
```

### Category

```json
{
  "id": "number | string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "image_url": "string (URL)",
  "parent_id": "number | null",
  "is_active": "boolean",
  "deleted_at": "string | null",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### CartItem

```json
{
  "product": "Product object",
  "quantity": "number",
  "selectedSize": "string",
  "selectedColor": "string"
}
```

### Coupon

```json
{
  "id": "number | string",
  "code": "string",
  "description": "string",
  "discount_type": "'percentage' | 'fixed'",
  "discount_value": "number",
  "usage_limit": "number",
  "used_count": "number",
  "valid_from": "string (ISO 8601)",
  "valid_until": "string (ISO 8601)",
  "is_active": "boolean",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### CarouselItem

```json
{
  "id": "number | string",
  "image_url": "string (URL)",
  "title": "string",
  "description": "string",
  "link": "string (URL path)",
  "order": "number",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### FeaturedProduct

```json
{
  "id": "number | string",
  "product_id": "number | string",
  "name": "string",
  "price": "number",
  "description": "string",
  "image_url": "string (URL)",
  "order": "number",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### PagedResult\<T\>

```json
{
  "data": "T[] (array of items)",
  "total": "number (total items in database)",
  "per_page": "number (items per page)",
  "current_page": "number (current page number)"
}
```

---

## 12. Error Handling

### Standard Error Response Format

All API errors follow this consistent format:

```json
{
  "message": "Human-readable error description",
  "errors": {
    "field_name": ["Validation error message 1", "Validation error message 2"]
  }
}
```

### HTTP Status Codes

| Status Code | Meaning                | Description                                          |
|-------------|------------------------|------------------------------------------------------|
| `200`       | OK                     | Request succeeded                                    |
| `201`       | Created                | Resource created successfully                        |
| `400`       | Bad Request            | Invalid request body or parameters                   |
| `401`       | Unauthorized           | Missing or invalid authentication token              |
| `403`       | Forbidden              | User doesn't have permission (e.g., non-admin)       |
| `404`       | Not Found              | Requested resource does not exist                    |
| `422`       | Unprocessable Entity   | Validation errors in the request                     |
| `500`       | Internal Server Error  | Something went wrong on the server                   |

### Authentication Errors

When a **401** error is received:
- The `AuthInterceptor` automatically clears stored tokens
- The user is redirected to the appropriate login page
- Admin users are redirected to `/admin/login`
- Regular users are redirected to `/login`

---

## Quick Reference — All Endpoints Summary

| #  | Method   | Endpoint                        | Auth Required | Admin Only | Description                |
|----|----------|---------------------------------|---------------|------------|----------------------------|
| 1  | POST     | `/register`                     | No            | No         | Register new user          |
| 2  | POST     | `/verify-otp`                   | No            | No         | Verify email OTP           |
| 3  | POST     | `/resend-otp`                   | No            | No         | Resend OTP                 |
| 4  | POST     | `/login`                        | No            | No         | User login                 |
| 5  | POST     | `/logout`                       | Yes           | No         | User logout                |
| 6  | GET      | `/me`                           | Yes           | No         | Get current user profile   |
| 7  | GET      | `/products`                     | Yes           | No         | List products (paginated)  |
| 8  | GET      | `/products/{id}`                | Yes           | No         | Get product details        |
| 9  | POST     | `/products`                     | Yes           | Yes        | Create product             |
| 10 | PUT      | `/products/{id}`                | Yes           | Yes        | Update product             |
| 11 | DELETE   | `/products/{id}`                | Yes           | Yes        | Delete product             |
| 12 | POST     | `/products/{id}/restore`        | Yes           | Yes        | Restore product            |
| 13 | GET      | `/categories`                   | Yes           | No         | List categories            |
| 14 | POST     | `/categories`                   | Yes           | Yes        | Create category            |
| 15 | PUT      | `/categories/{id}`              | Yes           | Yes        | Update category            |
| 16 | DELETE   | `/categories/{id}`              | Yes           | Yes        | Delete category            |
| 17 | POST     | `/categories/{id}/restore`      | Yes           | Yes        | Restore category           |
| 18 | GET      | `/cart`                         | Yes           | No         | Get cart items             |
| 19 | POST     | `/cart/add`                     | Yes           | No         | Add item to cart           |
| 20 | PUT      | `/cart/{itemId}`                | Yes           | No         | Update cart item           |
| 21 | DELETE   | `/cart/{itemId}`                | Yes           | No         | Remove cart item           |
| 22 | POST     | `/cart/{itemId}/restore`        | Yes           | No         | Restore cart item          |
| 23 | POST     | `/cart/checkout`                | Yes           | No         | Checkout cart              |
| 24 | GET      | `/orders`                       | Yes           | No         | List orders                |
| 25 | GET      | `/orders/{id}`                  | Yes           | No         | Get order details          |
| 26 | GET      | `/addresses`                    | Yes           | No         | List addresses             |
| 27 | POST     | `/addresses`                    | Yes           | No         | Create address             |
| 28 | PUT      | `/addresses/{id}`               | Yes           | No         | Update address             |
| 29 | DELETE   | `/addresses/{id}`               | Yes           | No         | Delete address             |
| 30 | POST     | `/addresses/{id}/restore`       | Yes           | No         | Restore address            |
| 31 | GET      | `/coupons`                      | Yes           | Yes        | List coupons               |
| 32 | GET      | `/coupons/{id}`                 | Yes           | Yes        | Get coupon details         |
| 33 | POST     | `/coupons`                      | Yes           | Yes        | Create coupon              |
| 34 | PUT      | `/coupons/{id}`                 | Yes           | Yes        | Update coupon              |
| 35 | DELETE   | `/coupons/{id}`                 | Yes           | Yes        | Delete coupon              |
| 36 | GET      | `/carousel`                     | Yes           | No         | List carousel items        |
| 37 | POST     | `/carousel`                     | Yes           | Yes        | Create carousel item       |
| 38 | PUT      | `/carousel/{id}`                | Yes           | Yes        | Update carousel item       |
| 39 | DELETE   | `/carousel/{id}`                | Yes           | Yes        | Delete carousel item       |
| 40 | GET      | `/featured-products`            | Yes           | No         | List featured products     |
| 41 | POST     | `/featured-products`            | Yes           | Yes        | Create featured product    |
| 42 | PUT      | `/featured-products/{id}`       | Yes           | Yes        | Update featured product    |
| 43 | DELETE   | `/featured-products/{id}`       | Yes           | Yes        | Delete featured product    |

---

**End of Document**
