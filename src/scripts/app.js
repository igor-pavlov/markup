import $ from 'jquery';
import Swiper from 'swiper';
import Choices from 'choices.js';
import "lightgallery.js";
import List from 'list.js';
import SimpleBar from 'simplebar';
import noUiSlider from 'nouislider';

jQuery = window.$ = window.jQuery = $;

const App = {
    init: () => {

        var swiper3 = new Swiper('.card--id-1 .card__works-mobile', {
            slidesPerView: 'auto',
            speed: 500,
            spaceBetween: 17
        });

        var swiper4 = new Swiper('.card--id-3 .card__works-mobile', {
            slidesPerView: 'auto',
            speed: 500,
            spaceBetween: 17
        });

        var swiper5 = new Swiper('.article__gallery-mobile', {
            slidesPerView: 'auto',
            speed: 500,
            spaceBetween: 17
        });

        const switchingActiveElement = function(element) {
            let thatElement = '.' + element;
            let activeElement = element + '--active';

            $(document).on("click", thatElement, function(e) {
                e.preventDefault();
                $(document).find(thatElement).removeClass(activeElement);
                $(this).addClass(activeElement);
            })
        };

        switchingActiveElement('line__item');
        switchingActiveElement('toggle__item');

        new Choices(".choices-target", {
            searchEnabled: false,
            searchChoices: false,
            itemSelectText: '',
            shouldSort: false
        });

        let galleriesPhoto = document.getElementsByClassName('card__gallery--photo');
        for(let i = 0; i < galleriesPhoto.length; i++) {
            lightGallery(galleriesPhoto[i]);
        }

        let articlePhoto = document.getElementsByClassName('article__gallery');
        for(let i = 0; i < articlePhoto.length; i++) {
            lightGallery(articlePhoto[i]);
        }

        let galleriesVideo = document.getElementsByClassName('card__gallery--video');
        for(let i = 0; i < galleriesVideo.length; i++) {
            lightGallery(galleriesVideo[i]);
        }

        var userList = new List('events', {valueNames: [ 'event' ]});

        if (document.getElementById('events__container')) {
            new SimpleBar(document.getElementById('events__container'));
        }

        if (document.getElementById('messages')) {
            new SimpleBar(document.getElementById('messages'));
        }

        const priceSlider = document.querySelector('.js-sidebar-slider');
        const input0 = document.getElementById('min-price');
        const input1 = document.getElementById('max-price');
        const inputs = [input0, input1];

        if (priceSlider) {
            noUiSlider.create(priceSlider, {
                start: [$(input0).data('value'), $(input1).data('value')],
                connect: true,
                range: {
                    'min': $(input0).data('min'),
                    'max': $(input1).data('max')
                }
            });

            priceSlider.noUiSlider.on('update', function (values, handle) {
                for (let item in values) {
                    if (values.hasOwnProperty(item)) {
                        values[item] = Math.round(values[item]);
                    }
                }
                inputs[handle].value = values[handle];
            });

            priceSlider.noUiSlider.on('set', function() {
                window.updateMinPriceInput();
                window.updateMaxPriceInput();
            });
        }
    }
};

$(document).ready(() => {
    App.init();

    if (document.getElementsByClassName('js-open-sidebar-mobile')[0]) {
        document.getElementsByClassName('js-open-sidebar-mobile')[0].onclick = function () {
            document.getElementsByClassName('page')[0].style.height = document.getElementsByClassName('sidebar')[0].offsetHeight + 'px';
            document.getElementsByClassName('page')[0].classList.add('is-ovh');
            document.getElementsByClassName('sidebar')[0].classList.add('sidebar--mobile');
        };
    }

    if (document.getElementsByClassName('sidebar__close')[0]) {
        document.getElementsByClassName('sidebar__close')[0].onclick = function() {
            document.getElementsByClassName('sidebar')[0].classList.remove('sidebar--mobile');
            document.getElementsByClassName('page')[0].classList.remove('is-ovh');
            document.getElementsByClassName('page')[0].style.height = '100%';
        };
    }

    if (document.getElementsByClassName('header__burger')[0]) {
        document.getElementsByClassName('header__burger')[0].onclick = function() {
            document.getElementsByClassName('page')[0].style.height = document.getElementsByClassName('header__menu')[0].offsetHeight + 'px';
            document.getElementsByClassName('page')[0].classList.add('is-ovh');
            document.getElementsByClassName('header__menu')[0].classList.add('header__menu--mobile');
        };
    }

    if (document.getElementsByClassName('header__close')[0]) {
        document.getElementsByClassName('header__close')[0].onclick = function() {
            document.getElementsByClassName('header__menu')[0].classList.remove('header__menu--mobile');
            document.getElementsByClassName('page')[0].classList.remove('is-ovh');
            document.getElementsByClassName('page')[0].style.height = '100%';
        };
    }

    if (document.getElementsByClassName('header__person-mobile')[0]) {
        document.getElementsByClassName('header__person-mobile')[0].onclick = function() {
            document.getElementsByClassName('page')[0].style.height = document.getElementsByClassName('person__menu')[0].offsetHeight + 'px';
            document.getElementsByClassName('page')[0].classList.add('is-ovh');
            document.getElementsByClassName('page')[0].classList.add('is-bg');
            document.getElementsByClassName('person__menu')[0].classList.add('person__menu--mobile');
        };
    }

    if (document.getElementsByClassName('is-bg')[0]) {
        document.getElementsByClassName('is-bg')[0].onclick = function() {
            document.getElementsByClassName('person__menu')[0].classList.remove('person__menu--mobile');
            document.getElementsByClassName('page')[0].classList.remove('is-ovh');
            document.getElementsByClassName('page')[0].classList.remove('is-bg');
            document.getElementsByClassName('page')[0].style.height = '100%';
        };
    }
});

// удаляет все пробелы в контентном диве, не переносить в боевую версию!
window.onload = function() {
    let emptyBlocks = document.getElementsByClassName('empty');
    for(let i = 0; i < emptyBlocks.length; i++) {
        emptyBlocks[i].innerHTML = '';
    }
};
