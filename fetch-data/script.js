let title = document.querySelector('.category-title')
let select = document.querySelector('#categories')
let inputSearch = document.querySelector('input')
let productCon = document.querySelector('#productCon')
let categoryList = []
let productList = []
let productRequestId = 0
let isLoadingProducts = false
let productError = ''

// handle category selection
select?.addEventListener('change', () => {
    if (select.value !== 'all') {
        title.textContent = select.value
    } else {
        title.textContent = "Products"
    }

    fetchProducts()
})

// Fetch categories
async function fetchCategories() {
    try {
        const response = await fetch('https://dummyjson.com/products/categories')

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`)
        }

        categoryList = await response.json()

        categoryList.forEach(element => {
            let option = document.createElement('option')
            option.value = element.slug
            option.textContent = element.name

            select?.appendChild(option)
        });
    } catch (e) {
        console.log('Unable to load categories', e.message)
    }
}
fetchCategories()

// Fetch products
async function fetchProducts() {
    const requestId = ++productRequestId
    isLoadingProducts = true
    productError = ''
    showProducts()

    try {
        const category = select?.value || 'all'
        const url = category === 'all'
            ? 'https://dummyjson.com/products?limit=10'
            : `https://dummyjson.com/products/category/${encodeURIComponent(category)}?limit=10`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`)
        }

        const result = await response.json()
        if (requestId !== productRequestId) return

        productList = result
        console.log(productList.products)
    } catch (e) {
        if (requestId !== productRequestId) return

        console.log('Unable to load products', e.message)
        productError = 'Unable to load products.'
    } finally {
        if (requestId === productRequestId) {
            isLoadingProducts = false
            showProducts()
        }
    }
}

// Show products
function showProducts() {
    productCon.innerHTML = ''

    if (isLoadingProducts) {
        productCon.innerHTML = '<p class="col-span-full">Loading products...</p>'
        return
    }

    if (productError) {
        productCon.innerHTML = `<p class="col-span-full">${productError}</p>`
        return
    }

    productList.products
        .filter(item => {
            const matchCategory = select.value === 'all' || item.category === select.value
            const matchSearch = item.category.includes(inputSearch?.value.toLocaleLowerCase())
            return matchCategory && matchSearch
        })
        .forEach(item => {
            const card = document.createElement('div')

            card.className = 'h-fit col-span-1 overflow-hidden rounded-xl shadow-md'

            card.innerHTML = `<div class="flex flex-col gap-2 w-full">
        <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" class="w-full object-cover object-center">
        <div class="p-2 flex flex-col gap-2">
          <div class="flex items-start justify-between">
            <h1 class="text-xs">${item.title}</h1>
            <p class="text-xs">Rs ${item.price}</p>
          </div>
          <p class="text-xs leading-none">${item.description}</p>
        </div>
      </div>`

            productCon?.appendChild(card)
        })
}

inputSearch?.addEventListener('input', showProducts)

fetchProducts()
