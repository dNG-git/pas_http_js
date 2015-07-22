//j// BOF

/*
direct JavaScript
All-in-one toolbox for HTML5 presentation and manipulation
----------------------------------------------------------------------------
(C) direct Netware Group - All rights reserved
https://www.direct-netware.de/redirect?js;djs

This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can
obtain one at http://mozilla.org/MPL/2.0/.
----------------------------------------------------------------------------
https://www.direct-netware.de/redirect?licenses;mpl2
----------------------------------------------------------------------------
#echo(jsDjsVersion)#
#echo(__FILEPATH__)#
*/

/**
 * @module Spinner
 */
define([ 'jquery' ], function($) {
	/**
	 * The "Spinner" instance shows and animates a 2D canvas based spinning
	 * circle indicating determinated or indeterminated progress.
	 *
	 * @class Spinner
	 * @param {Object} args Arguments to initialize a given Spinner
	 */
	function Spinner(args) {
		if (args === undefined
		    || (!('id' in args))
		    || (!('width' in args))
		    || (!('height' in args))
		   ) {
			throw new Error('Missing required arguments');
		}

		this.segments = 12;
		this.canvas_height = 0;
		this.canvas_width = 0;
		this.id = null;
		this.indeterminate = true;
		this.spinner_position = 0;
		this.value = 0;
		this.visible = false;

		var $canvas_parent = $("#" + args.id);

		this.$canvas = $('<canvas id="' + args.id + '_djs_spinner_canvas" width="' + args.width + '" height="' + args.height + '" />');
		$canvas_parent.append(this.$canvas);

		if (!('getContext' in this.$canvas.get(0))) {
			throw 'Canvas not supported';
		}

		if ('Spinner_class' in args) {
			this.$canvas.addClass(args.Spinner_class);
		} else if ($canvas_parent.data('djs-ui-spinner-class') != undefined) {
			this.$canvas.addClass($canvas_parent.data('djs-ui-spinner-class'));
		} else if ('djs_config' in self && 'Spinner_class' in self.djs_config) {
			this.$canvas.addClass(self.djs_config.Spinner_class);
		} else {
			this.$canvas.addClass('djs-ui-Spinner');
		}

		if ('Spinner_style' in args) {
			this.$canvas.css(args.Spinner_style);
		}

		if ('value' in args) {
			this.indeterminate = false;
			this.set_value(args['value']);
		}

		this.$canvas.data('djs-spinner', this);
	}

	/**
	 * Returns the current progress value.
	 *
	 * @method
	 * @return {Number} Progress value
	 */
	Spinner.prototype.get_value = function() {
		return this.value;
	}

	/**
	 * Sets the number of segments the spinner has.
	 *
	 * @method
	 * @param {Number} segments Number of segments
	 */
	Spinner.prototype.set_segments = function(segments) {
		this.segments = segments;
	}

	/**
	 * Sets the current progress value.
	 *
	 * @method
	 * @param {Number} value Progress value
	 */
	Spinner.prototype.set_value = function(value) {
		this.value = value;

		if (this.visible) {
			this.$canvas.queue('fx', this._paint).dequeue();
		}
	}

	/**
	 * Shows the spinner canvas and starts animating it.
	 *
	 * @method
	 */
	Spinner.prototype.show = function() {
		this.$canvas.show();
		this.visible = true;

		this.canvas_height = this.$canvas.height();
		this.canvas_width = this.$canvas.width();

		this.$canvas.queue('fx', this._paint);
	}

	/**
	 * Repaints the spinner canvas.
	 *
	 * @method
	 * @param {Function} next jQuery function to call that will dequeue the next
	 *                        item
	 */
	Spinner.prototype._paint = function(next) {
		var _this = $(this).data('djs-spinner');

		var circle_radius = Math.round(Math.min(_this.canvas_width, _this.canvas_height) / 2);

		var circle_gap = Math.ceil(circle_radius / 4);
		var circle_x = Math.round(_this.canvas_width / 2);
		var circle_y = Math.round(_this.canvas_height / 2);
		var indicator_fade_percentage = (1 / _this.segments);
		var indicator_intensity = 1;
		var indicator_value = 0;
		var line_length = Math.round(circle_radius - (circle_gap / 2));
		var line_size = Math.round(circle_radius / _this.segments) + 1;

		if (_this.indeterminate) {
			if (_this.spinner_position > 0) {
				indicator_intensity -= (indicator_fade_percentage * _this.spinner_position);
			}
		} else {
			if (_this.value >= 0 && _this.value <= 100) {
				indicator_value = _this.value;
			}

			if ((indicator_value / 100) < indicator_fade_percentage) {
				indicator_intensity = 0.5;
			}
		}

		var ctx = _this.$canvas.get(0).getContext('2d');
		ctx.clearRect(0, 0, _this.canvas_width, _this.canvas_height);

		ctx.lineWidth = line_size;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.strokeStyle = 'rgba(0, 0, 0, ' + indicator_intensity + ')';

		var arc = ((2 * Math.PI) / _this.segments);
		var arc_position = 0;

		if (_this.indeterminate) {
			arc *= -1;
		} else {
			arc_position = (-0.5 * Math.PI) + (arc / 2);
		}

		for (var i = 0; i < _this.segments; i++) {
			x_end = circle_x + Math.round(Math.cos((arc * i) + arc_position) * line_length);
			y_end = circle_y + Math.round(Math.sin((arc * i) + arc_position) * line_length);
			x_start = circle_x + Math.round(Math.cos((arc * i) + arc_position) * circle_gap);
			y_start = circle_y + Math.round(Math.sin((arc * i) + arc_position) * circle_gap);

			ctx.beginPath();
			ctx.moveTo(x_start, y_start);
			ctx.lineTo(x_end, y_end);
			ctx.stroke();

			var segment = (1 + i + _this.spinner_position);

			if (_this.indeterminate) {
				var indicator_fade_multiplicator = i + _this.spinner_position;

				if (segment >= _this.segments) {
					indicator_fade_multiplicator -= _this.segments;
				}

				indicator_intensity = 1 - (indicator_fade_percentage * indicator_fade_multiplicator);

				ctx.strokeStyle = 'rgba(0, 0, 0, ' + indicator_intensity + ')';
			} else if (indicator_intensity > 0.5 && indicator_value < (((1 + segment) / _this.segments) * 100)) {
				indicator_intensity = 0.5;

				ctx.strokeStyle = 'rgba(0, 0, 0, ' + indicator_intensity + ')';
			}
		}

		if (_this.indeterminate) {
			_this.spinner_position += 1;

			if (_this.spinner_position >= _this.segments) {
				_this.spinner_position = 0;
			}

			_this.$canvas.delay(100).queue('fx', _this._paint);
			next();
		}
	}

	return Spinner;
});

//j// EOF