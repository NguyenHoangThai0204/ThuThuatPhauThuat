(function ($) {
    $.fn.attachDateTimeGroups = function (options) {
        var settings = $.extend({
            format: "DD-MM-YYYY HH:mm:ss",
            defaultDate: moment(),
            icons: {
                time: 'fa fa-clock',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-dot-circle-o',
                clear: 'fa fa-trash',
                close: 'fa fa-times'
            }
        }, options);

        return this.each(function () {
            var $input = $(this);

            $input.datetimepicker(settings);

            // generate groups từ format
            let groups = [];
            let cursor = 0;
            settings.format.split(/[^A-Za-z]/).filter(Boolean).forEach(token => {
                let len = token.length;
                groups.push([cursor, cursor + len]);
                cursor += len + 1;
            });

            function selectGroup(input, pos) {
                var g = groups.find(g => pos >= g[0] && pos <= g[1]);
                if (g) {
                    setTimeout(() => input.setSelectionRange(g[0], g[1]), 0);
                }
            }

            $input.on("focus", function () {
                selectGroup(this, 0);
            });

            $input.on("click", function () {
                selectGroup(this, this.selectionStart);
            });

            $input.on("keydown", function (e) {
                var input = this;
                var cursorPos = input.selectionStart;
                var current = groups.findIndex(g => cursorPos >= g[0] && cursorPos < g[1]);

                if (e.key === "ArrowRight" || e.key === "Tab") {
                    e.preventDefault();
                    current = (current + 1) % groups.length;
                    selectGroup(input, groups[current][0]);
                } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    current = (current - 1 + groups.length) % groups.length;
                    selectGroup(input, groups[current][0]);
                }
            });
        });
    };
})(jQuery);
