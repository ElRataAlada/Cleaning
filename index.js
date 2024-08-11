import service_info from './services.json';

const UNITS = {
    "м²": "Площа",
    "кг": "Вага",
}

document.addEventListener("DOMContentLoaded", function (e) {

    const cards = document.querySelector('#service_cards')
    const other_cards = document.querySelector('#other_service_cards')

    let ui_cart_wrapper = document.querySelector('.cart_wrapper')
    let ui_cart = document.querySelector('#cart')

    const order_popup = document.querySelector('#order_popup_items')
    const order_total = document.querySelector('#order_total')

    const header_action_button = document.querySelector('header').querySelector('.order_button')

    // Burger
    const burger = document.querySelector('.burger_wrapper')
    const burger_menu = burger.querySelector('.burger_menu')

    burger.addEventListener('click', (e) => {
        burger.classList.toggle('active')

        if (burger.classList.contains('active')) document.body.style.overflowY = 'hidden'
        else document.body.style.overflowY = 'auto'
    })

    const menu = document.querySelector('#header_menu').cloneNode(true)
    menu.setAttribute('id', '')

    burger_menu.appendChild(menu)
    ///


    // Mobile cart
    const copy = ui_cart_wrapper.cloneNode(true)
    copy.querySelector('.cart').removeAttribute('animated')
    const width = document.body.clientWidth;

    if (width <= 970) {
        const main = document.body.querySelector('main')
        main.appendChild(copy)

        ui_cart_wrapper = main.querySelector('.cart_wrapper')
        ui_cart = main.querySelector('#cart')
    }
    //


    // Create MAIN service cards
    service_info.forEach(service => createServiceCard(service))
    const service_cards = cards.querySelectorAll('.card')

    service_cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const title = e.currentTarget.querySelector('.card__header_title').innerText
            addToCart(service_info.find(el => el.title === title))
        })
    })

    function createServiceCard(service) {
        if (service.type !== 'main') return

        const card = '' +
            '<div class="card">' +
            '    <div class="card__header">' +
            `        <h3 class="card__header_title">${service.title}</h3>` +
            '' +
            '        <div class="card__header_info">' +
            '            <div class="price">' +
            '                <img src="./img/ico/hrivnia.svg" alt="hrivnya">' +
            `                від <span>${service.price}</span> грн` +
            '            </div>' +
            '            <div class="time">' +
            '                <img src="./img/ico/time.svg" alt="hrivnya">' +
            `                <span >${service.time}</span> год` +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '    <div class="card__footer">' +
            `        <img src="${service.imageURL}" alt="cleaner">` +
            '    </div>' +
            '</div>' +
            '';

        cards.innerHTML += card
    }
    ///


    // Create OTHERT service cards
    service_info.forEach(service => createOtherServiceCard(service))
    const other_service_cards = other_cards.querySelectorAll('.card')

    other_service_cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const title = e.currentTarget.querySelector('.card__header_title').innerText
            addToCart(service_info.find(el => el.title === title))
        })
    })

    function createOtherServiceCard(service) {
        if (service.type !== 'other') return

        const card = '' +
            '<div class="card">' +
            '    <div class="card__header">' +
            '        <div class="title">' +
            `            <img src="${service.icoURL}" alt="card icon">` +
            `            <h3 class="card__header_title">${service.title}</h3>` +
            '        </div>' +

            '        <div class="price">' +
            `            від <span id="price">${service.price}</span> грн  / <span id="unit">${service.unit}</span>` +
            '        </div>' +
            '    </div>' +
            '</div>' +
            '';

        other_cards.innerHTML += card
    }
    ///


    // Popup
    ui_cart.addEventListener('click', e => openOrderPopup())

    function openOrderPopup() {
        document.querySelector('.order_popup').parentElement.classList.add('visible')
        document.body.style.overflowY = 'hidden'
    }

    function closeOrderPopup() {
        document.querySelector('.order_popup').parentElement.classList.remove('visible')
        document.body.style.overflowY = 'auto'
    }

    document.querySelectorAll('.inner_popup').forEach(el =>
        el.addEventListener('click', e => e.stopPropagation())
    )

    document.querySelectorAll('.popup').forEach(popup => {
        popup.addEventListener('click', e => closeOrderPopup())
    })
    ///

    
    // Cart
    let cart = []
    getCart()

    function addToCart(service) {
        const cartIntem = cart.find(el => el.service.title === service.title)

        if (cartIntem) cart.splice(cart.indexOf(cartIntem), 1)
        else cart.push({ service: service, amount: 0 })

        writeCart(cart)
        getCart()
    }

    function deleteFromCart(title, deleteAll = false) {
        const cartElement = cart.find(el => el.service.title === title)
        if (!cartElement) return

        if (deleteAll || cartElement.amount <= 1) cart.splice(cart.indexOf(cartElement), 1)
        else cartElement.amount--

        writeCart(cart)
        getCart()
    }

    function getCart() {
        cart = JSON.parse(localStorage.getItem('cart')) || []

        const ui_cart_info = ui_cart.querySelector('.cart_info')

        if (cart.length) {
            ui_cart_wrapper.classList.remove('hidden')
            header_action_button.classList.add('hidden')
        }
        else {
            ui_cart_wrapper.classList.add('hidden')
            header_action_button.classList.remove('hidden')
            closeOrderPopup()
        }

        ui_cart_info.innerText = cart.length

        service_cards.forEach(card => {
            const title = card.querySelector('.card__header_title').innerText

            const isInCart = cart.find(el => el.service.title === title)

            if (isInCart) card.setAttribute('incart', '')
            else card.removeAttribute('incart')
        })

        other_service_cards.forEach(card => {
            const title = card.querySelector('.card__header_title').innerText

            const isInCart = cart.find(el => el.service.title === title)

            if (isInCart) card.setAttribute('incart', '')
            else card.removeAttribute('incart')
        })

        order_popup.innerHTML = ''
        cart.forEach(el => order_popup.innerHTML += createCartItem(el))

        order_total.innerText = cart.reduce((sum, el) => sum + el.amount * el.service.price, 0)

        order_popup.querySelectorAll('.delete_btn').forEach(button => {
            button.addEventListener('click', e => {
                const title = e.currentTarget.parentElement.querySelector('.title').innerText
                deleteFromCart(title, true)
            })
        })

        order_popup.querySelectorAll('.service_item').forEach(item => {
            const input = item.querySelector('.amount_input')
            const title = item.querySelector('.title').innerText

            const cartItem = cart.find(el => el.service.title === title)

            if (cartItem?.amount > 0) input.value = cartItem.amount

            input.addEventListener('blur', e => {
                cartItem.amount = +e.target.value
                writeCart(cart)
                getCart()
            })
        })
    }

    function writeCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }

    function createCartItem(cartItem) {
        const item = cartItem.service

        let element = '' +
            '<div class="service_item">' +
            '' +
            '    <div class="name">' +
            '        <button class="delete_btn" type="button">' +
            '            <img src="./img/ico/bin.svg" alt="bin">' +
            '        </button>'

        if (item.icoURL) element += `<img class="icon" src="${item.icoURL}" alt="icon">`

        element +=
            `        <h4 class="title">${item.title}</h4>` +
            '    </div>' +
            `    <div class="amount"> <input class="amount_input" type="number" placeholder="${UNITS[item.unit]}"/><span>${item.unit}</span></div>` +
            `    <div class="price">${item.price} грн / ${item.unit}</div>` +
            `    <div class="total">${item.price * cartItem.amount} <span>грн</span></div>` +
            '</div>'

        return element
    }
    ///
});


