(function ($) {
    
    var isBuilder = $('html').hasClass('is-builder');
    if (!isBuilder) {

        /*google iframe*/
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var players = [];

        /* get youtube id */
        function getVideoId(url) {
            if ('false' == url) return false;
            var result = /(?:\?v=|\/embed\/|\.be\/)([-a-z0-9_]+)/i.exec(url) || /^([-a-z0-9_]+)$/i.exec(url);
            return result ? result[1] : false;
        }
        /* google iframe api init function */
        window.onYouTubeIframeAPIReady = function () {
            var ytp = ytp || {};
            ytp.YTAPIReady || (ytp.YTAPIReady = !0,
                jQuery(document).trigger("YTAPIReady"));
            $('.video-slide').each(function (i) {
                var index = $(this).index();
                var section = $(this).closest('section');
                $('.video-container').eq(i).append('<div id ="bp-video-' + i + '" class="bp-background-video" data-video-num="' + i + '"></div>')
                    .append('<div class="item-overlay"></div>');
                     $(this).attr('data-video-num', i);
                if ($(this).attr('data-video-url').indexOf('vimeo.com') != -1) {
                    var options = {
                        id: $(this).attr('data-video-url'),
                        width: '100%',
                        height: '100%',
                        loop: true
                    };
                   
                    var player = new Vimeo.Player('bp-video-' + i, options);
                    player.playVideo = Vimeo.play;
                } else {
               
                var player = new YT.Player('bp-video-' + i, {
                    height: '100%',
                    width: '100%',
                    videoId: getVideoId($(this).attr('data-video-url')),
                    events: {
                        'onReady': onPlayerReady,
                    }
                })}
                players.push(player);
            });
        }

        function onPlayerReady(event) {
            if ($(event.target).closest('.bp-slider').hasClass('in')) {
                event.target.playVideo();
            }
        }
        /* youtube default preview */
        function getPreviewUrl(videoId, quality) {
            return 'https://img.youtube.com/vi/' + videoId + '/' +
                (quality || '') + 'default.jpg';
        }
    }
    /* Masonry Grid */
    $(document).on('add.cards change.cards', function (event) {
        var $section = $(event.target),
            allItem = $section.find('.bp-gallery-filter-all');
        if (!$section.hasClass('bp-slider-carousel')) return;
        var filterList = [];

        $section.find('.bp-gallery-item').each(function (el) {
            var tagsAttr = ($(this).attr('data-tags') || "").trim();
            var tagsList = tagsAttr.split(',');
            tagsList.map(function (el) {
                var tag = el.trim();

                if ($.inArray(tag, filterList) == -1)
                    filterList.push(tag);
            })
        })
        if ($section.find('.bp-gallery-filter').length > 0 && $(event.target).find('.bp-gallery-filter').hasClass('gallery-filter-active')) {
            var filterHtml = '';
            $section.find('.bp-gallery-filter ul li:not(li:eq(0))').remove();
            filterList.map(function (el) {
                filterHtml += '<li>' + el + '</li>'
            });
            $section.find('.bp-gallery-filter ul').append(allItem).append(filterHtml);
            $section.on('click', '.bp-gallery-filter li', function (e) {
                $li = $(this);
                $li.parent().find('li').removeClass('active')
                $li.addClass('active');

                var $mas = $li.closest('section').find('.bp-gallery-row');
                var filter = $li.html().trim();

                $section.find('.bp-gallery-item').each(function (i, el) {
                    var $elem = $(this);
                    var tagsAttr = $elem.attr('data-tags');
                    var tags = tagsAttr.split(',');
                    tagsTrimmed = tags.map(function (el) {
                        return el.trim();
                    })
                    if ($.inArray(filter, tagsTrimmed) == -1 && !$li.hasClass('bp-gallery-filter-all')) {
                        $elem.addClass('bp-gallery-item__hided');
                        setTimeout(function () {
                            $elem.css('left', '300px');
                        }, 200);
                    } else {
                        $elem.removeClass('bp-gallery-item__hided')
                    };

                })
                setTimeout(function () {
                    $mas.closest('.bp-gallery-row').trigger('filter');
                }, 50);
            })
        } else {
            $section.find('.bp-gallery-item__hided').removeClass('bp-gallery-item__hided');
            $section.find('.bp-gallery-row').trigger('filter');
        }
        if (!isBuilder) {

            $section.find('.video-slide').each(function (i) {
                var index = $(this).closest('.bp-gallery-item').index();

               // setImgSrc($(this));
            });
        }

        if (typeof $.fn.masonry !== 'undefined') {
            $section.outerFind('.bp-gallery').each(function () {
                var $msnr = $(this).find('.bp-gallery-row').masonry({
                    itemSelector: '.bp-gallery-item:not(.bp-gallery-item__hided)',
                    percentPosition: true
                });
                // reload masonry (need for adding new or resort items)
                $msnr.masonry('reloadItems');
                $msnr.on('filter', function () {
                    $msnr.masonry('reloadItems');
                    $msnr.masonry('layout');
                    // update parallax backgrounds
                    $(window).trigger('update.parallax')
                }.bind(this, $msnr))
                // layout Masonry after each image loads
                $msnr.imagesLoaded().progress(function () {
                    $msnr.masonry('layout');
                });
            });
        }
    });
    $('.bp-gallery-item').on('click', 'a', function (e) {
        e.stopPropagation();
    })
    var timeout;
    var timeout2;

    function fitLBtimeout() {
        clearTimeout(timeout);
        timeout = setTimeout(fitLightbox, 50);
    }

    /* Lightbox Fit */
    function fitLightbox() {
        var $lightbox = $('.bp-gallery .modal');
        if (!$lightbox.length) {
            return;
        }

        var windowPadding = 0;
        var bottomPadding = 10;
        var wndW = $(window).width() - windowPadding * 2;
        var wndH = $(window).height() - windowPadding * 2;
        $lightbox.each(function () {
            var setWidth, setTop;
            var isShown = $(this).hasClass('in');
            var $modalDialog = $(this).find('.modal-dialog');
            var $currentImg = $modalDialog.find('.carousel-item.active > img');

            if ($modalDialog.find('.carousel-item.prev > img, .carousel-item.next > img').length) {
                $currentImg = $modalDialog.find('.carousel-item.prev > img, .carousel-item.next > img').eq(0);
            }

            var lbW = $currentImg[0].naturalWidth;
            var lbH = $currentImg[0].naturalHeight;

            // height change
            if (wndW / wndH > lbW / lbH) {
                var needH = wndH - bottomPadding * 2;
                setWidth = needH * lbW / lbH;
            }

            // width change
            else {
                setWidth = wndW - bottomPadding * 2;
            }
            // check for maw width
            setWidth = setWidth >= lbW ? lbW : setWidth;

            // set top to vertical center
            setTop = (wndH - setWidth * lbH / lbW) / 2;

            $modalDialog.css({
                width: parseInt(setWidth),
                top: setTop + windowPadding
            });
        });
    }


    /* pause/start video on different events and fit lightbox */
    var $window = $(document).find('.bp-gallery');
    $window.on('show.bs.modal', function (e) {

        clearTimeout(timeout2);
        var timeout2 = setTimeout(function () {
            var index = $(e.relatedTarget).parent().index();
            var slide = $(e.target).find('.carousel-item').eq(index).find('.bp-background-video');
            $(e.target).find('.carousel-item .bp-background-video')
            if (slide.length > 0) {
                var player =  players[+slide.attr('data-video-num')];
                player.playVideo?player.playVideo():player.play();
            }
        }, 500);
        fitLBtimeout();
    })
    $window.on('slide.bs.carousel', function (e) {
        var ytv = $(e.target).find('.carousel-item.active .bp-background-video');
        if (ytv.length > 0) {
            var player =  players[+ytv.attr('data-video-num')];
            player.pauseVideo?player.pauseVideo():player.pause();
        }
    });
    $(window).on('resize load', fitLBtimeout);
    $window.on('slid.bs.carousel', function (e) {
        var ytv = $(e.target).find('.carousel-item.active .bp-background-video');
        if (ytv.length > 0) {
            var player =  players[+ytv.attr('data-video-num')];
            player.playVideo?player.playVideo():player.play();
        }
        fitLBtimeout();
    });
    $window.on('hide.bs.modal', function (e) {
        players.map(function (player, i) {
            player.pauseVideo?player.pauseVideo():player.pause();
        });
    });
} (jQuery));