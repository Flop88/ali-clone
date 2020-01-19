'use strict'
document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const search = document.querySelector('.search'),
        goodsWrapper = document.querySelector('.goods-wrapper'),
        cartBtn = document.getElementById('cart'),
        wishlistBtn = document.getElementById('wishlist'),
        cart = document.querySelector('.cart'),
        category = document.querySelector('.category'),
        cardCounter = cartBtn.querySelector('.counter'),
        wishlistCounter = wishlistBtn.querySelector('.counter'),
        cartWrapper = document.querySelector('.cart-wrapper')

    // Создаем массив с id товаров попавших в wishlist
    const wishlist = []

    // Создаем объект корзины с id товаров и их количеством
    const goodsBasket = {}

    //  Функция, показывающая спинер в каталоге и в корзине
    const loading = () => {
        const spinner = `
            <div id="spinner" ><div class="spinner-loading">
            <div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>
        `
        goodsWrapper.innerHTML = spinner // каталог
        cartWrapper.innerHTML = spinner // корзина
    }

    // Извлечение карточек из БД с их последующей фильтрацией и рендиренгом
    const getGoods = (handler, filter) => {
        loading() // спиннер
        setTimeout(() => { // вводим временную задержку для демонстрации спиннера
            fetch('http://git.lekua.in.ua/AliJSpress/db/db.json') // извлечение товаров из БД
                .then(response => response.json())
                .then(filter)  // фильтрация
                .then(handler); // рендеринг
        }, 1000);
    };

    // Создаем карточку товара для каталога
    const createGardsGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `
        <div class="card">
            <div class="card-img-wrapper">
                <img class="card-img-top" src="${img}" alt="">
                <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''} "
                data-goods-id="${id}"></button>
            </div>
            <div class="card-body justify-content-between">
                <a href="#" class="card-title">${title}</a>
                <div class="card-price">${price} ₽</div>
                <div>
                    <button class="card-add-cart" data-goods-id="${id}">Добавить в корзину</button>
                </div>
            </div>
        </div>
        `;
        return card;
    };

    // Рендеринг карточек товаров
    const renderCard = items => {
        goodsWrapper.textContent = '';
        if (items.length) {
            items.forEach(({ id, title, price, imgMin }) => {
                goodsWrapper.append(createGardsGoods(id, title, price, imgMin));
            })
        } else {
            goodsWrapper.textContent = '❌ Извините, мы не нашли товаров по вашему запросу!'
        }
    }

    // Рендеринг всех карточек товаров для корзины
    const renderBasket = items => {
        cartWrapper.innerHTML = ''
        if (items.length) {
            items.forEach(({ id, title, price, imgMin }) => {
                cartWrapper.append(createGardGoodsBasket(id, title, price, imgMin));
            })
        } else {
            cartWrapper.innerHTML = '<div id="cart-empty">Ваша корзина пока пуста</div >'
        }
    }

    // Рендеринг одной карточки товара для корзины
    const createGardGoodsBasket = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'goods';
        card.innerHTML = `
            <div class="goods-img-wrapper">
                <img class="goods-img" src="${img}" alt="">
            </div>
            <div class="goods-description">
                <h2 class="goods-title">${title}</h2>
                <p class="goods-price">${price} ₽</p>
            </div>
            <div class="goods-price-count">
                <div class="goods-trigger">
                    <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" data-goods-id="${id}"></button>
                    <button class="goods-delete" data-goods-id="${id}"></button>
                </div>
                <div class="goods-count">${goodsBasket[id]}</div>
            </div>
        `;
        return card;
    };

    //  Рендеринг товаров, попавших в список желаний
    const showWishList = () => {
        const filterWishlist = goods => goods.filter(item => wishlist.includes(item.id))
        getGoods(renderCard, filterWishlist)
    }

    // Расчет стоимости всех товаров в корзине
    const calcTotalPrice = goods => {
        // традиционный способ суммирования
        // let sum = 0
        // for (const item of goods) {
        //     sum += item.price * goodsBasket[item.id]
        //     console.log('item: ', item);
        // }
        //  продвинутый метод суммирования
        let sum = goods.reduce((accum, item) => {
            return accum + item.price * goodsBasket[item.id]
        }, 0)
        cart.querySelector('.cart-total>span').textContent = sum.toFixed(2)

    }

    // Открываем корзину
    //  - фильтр товаров для корзины
    const showCardBasket = goods => {
        const basketGoods = goods.filter(item => goodsBasket.hasOwnProperty(item.id))
        calcTotalPrice(basketGoods)
        return basketGoods
    }
    //  - рендеринг корзины
    const openCart = event => {
        event.preventDefault();
        cart.style.display = 'flex';
        document.addEventListener('keyup', closeCart);
        getGoods(renderBasket, showCardBasket)
        goodsWrapper.innerHTML = ''
    };

    // Закрываем корзину
    const closeCart = event => {
        const target = event.target;

        if (target === cart || target.classList.contains('cart-close') || event.keyCode === 27) {
            cart.style.display = '';
            document.addEventListener('keyup', closeCart);
            getGoods(renderCard, randomSort);
        }
    };

    // Сортировка карточек в случайном порядке
    const randomSort = item => item.sort(() => Math.random() - 0.5);

    //  Используем замыкание и создаем функцию для фильтрации товаров по категории.
    const wrapperCategoryFilter = category => goods => goods.filter(item => item.category.includes(category));

    // Выбор карточек из определенной категории
    const chooseCategory = event => {
        event.preventDefault();
        const target = event.target;

        if (target.classList.contains('category-item')) {
            const category = target.dataset.category;
            // Создаем альтернативный фильтр с помощью метода bind()
            // const categoryFilter = goods => goods.filter(item => item.category.includes(category))
            // categoryFilter.bind(this, category)
            const categoryFilter = wrapperCategoryFilter(category);
            getGoods(renderCard, categoryFilter);
        };
    };

    // Поиск товаров
    const searchGoods = event => {
        event.preventDefault()
        const input = event.target.elements.searchGoods
        const inputValue = input.value.trim()
        if (inputValue !== '') {
            const searchString = new RegExp(inputValue, 'i')
            getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)))
        } else {
            search.classList.add('error')
            setTimeout(() => {
                search.classList.remove('error')
            }, 2000);
        }
        input.value = ''
    }

    // Работа с куками в которых храним id товаров для корзины
    // - поиск куки по его имени
    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    // Сoхраниение и извлечение куки из хранилища браузера
    const cookieQuery = get => {
        if (get) {
            if (getCookie('goodsBasket')) {
                // копируем куки с id товаров корзины в объект корзина
                Object.assign(goodsBasket, JSON.parse(getCookie('goodsBasket')))
            }
            checkCount()
        } else {
            // записываем данные об id товаров из корзины в куки
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)};max-age=86400e3`
        }
    }

    // Количество товаров в корзине и в списке понравившихся
    const checkCount = () => {
        cardCounter.textContent = Object.keys(goodsBasket).length
        wishlistCounter.textContent = wishlist.length
    }

    // Извлечение и сохраниение id понравившиеся товары из localStorage 
    const storageQuery = get => {
        if (get) {
            if (localStorage.getItem('wishlist')) {
                const wishlistStorage = JSON.parse(localStorage.getItem('wishlist'))
                wishlist.push(...wishlistStorage) // массив преобразуем в набор элементов
            }
            checkCount()
        } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist))
        }
    }

    // Удаляем или записываем id товара в массив WISHLIST (понравившиеся товары)
    const toggleWishlist = (id, elem) => {
        if (wishlist.includes(id)) {
            wishlist.splice(wishlist.indexOf(id), 1)
            elem.classList.remove('active') // убираем подсветку иконки "сердечко"
        } else {
            wishlist.push(id)
            elem.classList.add('active') // добавляем подсветку иконки "сердечко"
        }
        checkCount() // подсчитываем количество понравившихся товаров
        storageQuery() // сохраняем id понравившихся товаров в localStorage
    }

    // id товара записываем в объект КОРЗИНА
    const addBasket = (id) => {
        if (goodsBasket[id]) {
            goodsBasket[id] += 1
        } else {
            goodsBasket[id] = 1
        }
        checkCount() // подсчитываем количество товаров в корзине
        cookieQuery() // сохраняем id и количество товаров в куки браузера
    }

    // Обработчик клика внутри карточки товара
    const handlerGoods = event => {
        const target = event.target
        //  если товар  добавляем в список желаний
        if (target.classList.contains('card-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId, target)
        }
        //  если товар  добавляем в корзину
        if (target.classList.contains('card-add-cart')) {
            addBasket(target.dataset.goodsId)
        }
    }

    // Удаление товара из корзины
    const removeGoods = id => {
        delete goodsBasket[id] // удаление id товара из корзины
        checkCount() // пересчет стоимости товаров находящихся в корзине
        cookieQuery() // записись объекта корзина с id и количеством товаров в куки браузера
        getGoods(renderBasket, showCardBasket) // рендеринг новой корзины
        goodsWrapper.innerHTML = '' // не показываем каталог товаров; только то, что вкорзине
    }

    // Обработка событий инициализированных внутри корзины
    const handlerBasket = () => {
        const target = event.target
        if (target.classList.contains('goods-add-wishlist')) { // кликнули по иконке "сердечко"
            toggleWishlist(target.dataset.goodsId, target)
        }
        if (target.classList.contains('goods-delete')) { // кликнули по иконке "мусорное ведро"
            removeGoods(target.dataset.goodsId)
        }
    }

    // Назначаем обработчики событий
    category.addEventListener('click', chooseCategory) // показать товары из выбранной категории
    search.addEventListener('submit', searchGoods) // поиск товара
    goodsWrapper.addEventListener('click', handlerGoods) // показать все товары
    wishlistBtn.addEventListener('click', showWishList) // показать товары из списка желаний
    cartBtn.addEventListener('click', openCart) // открыть корзину
    cart.addEventListener('click', closeCart) // закрыть корзину
    cartWrapper.addEventListener('click', handlerBasket) // клик по иконкам внутри корзины

    // Инициализация магазина
    const storeInit = () => {
        // - загрузка товаров и рендеринг их карточек 
        getGoods(renderCard, randomSort);
        // - извлечение из localStorage id товаров, которые были добавленны в список желаний
        storageQuery(true)
        // - извлечение из куки браузера id товаров добавленных в корзину
        cookieQuery(true)
    }

    storeInit()

});