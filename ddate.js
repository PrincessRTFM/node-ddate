#!/usr/bin/env node

const Conf = require('conf');
const chalk = require('chalk');
const pkg = require('./package.json');

const CONFIG_DEFAULT = Object.freeze({
	format: '%{%A, %d %B%}%[ (%H)%], %Y Year of Our Lady Discord',
	holydays: {
		"Chaos": {
			'#5': 'Mungday',
			'#50': 'Chaoflux',
		},
		"Discord": {
			'#5': 'Mojoday',
			'#50': 'Discoflux',
		},
		"Confusion": {
			'#5': 'Syaday',
			'#50': 'Confuflux',
		},
		"Bureaucracy": {
			'#5': 'Zaraday',
			'#50': 'Bureflux',
		},
		"The Aftermath": {
			'#5': 'Maladay',
			'#50': 'Afflux',
		},
	},
	localeFormatOptions: {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: '2-digit',
	},
	cli: {
		shortOutput: false,
	},
});
const cfg = new Conf({
	defaults: CONFIG_DEFAULT,
	projectName: pkg.name,
});
const DAYS_OF_WEEK = Object.freeze([
	"Sweetmorn",
	"Boomtime",
	"Pungenday",
	"Prickle-Prickle",
	"Setting Orange",
]);
const MONTHS = Object.freeze([
	"Chaos",
	"Discord",
	"Confusion",
	"Bureaucracy", // I can NEVER remember how to spell this one...
	"The Aftermath",
]);
const ABBREV = Object.freeze({
	"Sweetmorn": "SM",
	"Boomtime": "BT",
	"Pungenday": "PD",
	"Prickle-Prickle": "PP",
	"Setting Orange": "SO",
	"St. Tib's Day": "St Tib",
	"Chaos": "Chs",
	"Discord": "Dsc",
	"Confusion": "Cfn",
	"Bureaucracy": "Bcy",
	"The Aftermath": "Afm",
});
const DAYS_PER_MONTH = [
	31,
	28,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31,
];

function mapSpecifier(erisia, fullMatch, flag, specifier) {
	let value = '';
	let padSize = 0;
	switch (specifier) {
		case 'A':
			value = erisia.dayName;
			break;
		case 'a':
			value = ABBREV[erisia.dayName];
			break;
		case 'B':
			value = erisia.monthName;
			break;
		case 'b':
			value = ABBREV[erisia.monthName];
			break;
		case 'C':
			value = Math.floor(erisia.year / 100);
			padSize = 2;
			break;
		case 'd':
			value = erisia.day;
			padSize = 2;
			break;
		case 'j':
			value = erisia.day + 73 * (erisia.month - 1);
			padSize = 3;
			break;
		case 'm':
			value = erisia.month;
			break;
		case 'M':
			value = erisia.month - 1;
			if (value < 0) {
				value = 0;
			}
			break;
		case 'n':
			value = "\n";
			break;
		case 't':
			value = "\t";
			break;
		case 'u':
			value = erisia.dayOfWeek;
			break;
		case 'W':
			value = erisia.dayOfWeek - 1;
			if (value < 0) {
				value = 0;
			}
			break;
		case 'y':
			value = parseInt(String(erisia.year).slice(-2), 10);
			padSize = 2;
			break;
		case 'Y':
			value = erisia.year;
			padSize = 4;
			break;
		case 'H':
			if (erisia.holyDay) {
				value = erisia.holyDay;
			}
			else {
				value = flag + specifier;
				flag = '';
			}
			break;
		default:
			throw new RangeError(`ddate conversion specifier '${specifier}' is unknown`);
	}
	value = String(value);
	switch (flag) {
		case '^':
			value = value.toUpperCase();
			break;
		case '#':
			value = value.toLowerCase();
			break;
		case '':
		case '0':
			value = value.padStart(padSize, '0');
			break;
		case '_':
			value = value.padStart(padSize, ' ');
			break;
		case '-':
			// nop
			break;
		default:
			throw new RangeError(`ddate conversion specifier flag '${flag}' is unknown`);
	}
	return value;
}
function getOriginDate(source) {
	const ONE_DAY = 1000 * 60 * 60 * 24;
	let origin = NaN;
	switch (String(source).toLowerCase()) { // TODO: better parsing, if I can figure out a good way to do it
		case 'tomorrow':
			origin = new Date().getTime() + ONE_DAY;
			break;
		case 'today':
			origin = new Date();
			break;
		case 'yesterday':
			origin = new Date().getTime() - ONE_DAY;
			break;
		default:
			if (String(source).match(/^\d+$/u)) {
				origin = parseInt(source, 10);
			}
			else if (String(source).match(/^\d{4}[-\s]\d\d?[-\s]\d\d?$/u)) { // ISO 8601, loosely
				const [
					year,
					month,
					day,
				] = String(source)
					.split(/[-\s]/u)
					.map(v => parseInt(v, 10));
				origin = new Date(year, month - 1, day);
			}
			break;
	}
	if (isNaN(origin)) {
		origin = new Date();
	}
	if (typeof origin == 'number') {
		origin = new Date(origin);
	}
	return origin;
}

class DDate {
	constructor(initialDate) {
		this.thuddite = initialDate;
	}
	get thuddite() {
		if (!(this._thuddite instanceof Date)) {
			this._thuddite = new Date();
		}
		return this._thuddite;
	}
	set thuddite(boring) {
		if (boring instanceof DDate) {
			this._thuddite = new Date(boring.thuddite.getTime());
		}
		else if (boring instanceof Date) {
			this._thuddite = boring;
		}
		else if (typeof boring == 'number' || typeof boring == 'string') {
			this._thuddite = new Date(boring);
		}
		else if (typeof boring == 'undefined') {
			this._thuddite = new Date();
		}
		if (!(this._thuddite instanceof Date)) {
			this._thuddite = new Date();
		}
	}
	get fnord() {
		// This is where we do... THE MAGICS
		const thud = this.thuddite;
		let year = thud.getFullYear();
		const leapYear = (
			(year % 100 == 0)
			&& (year % 400 == 0)
		)
		|| (
			(year % 4 == 0)
			&& (year % 100 != 0)
		);
		year += 1166;
		let dayOfYear = thud.getDate();
		const thuddianMonth = thud.getMonth();
		if (thuddianMonth) {
			for (let correcting = 0; correcting < thuddianMonth; correcting++) {
				dayOfYear += DAYS_PER_MONTH[correcting];
			}
			if (leapYear && thuddianMonth > 1) { // Have to account for that leap year...
				dayOfYear++;
			}
		}
		const tibsDay = leapYear && dayOfYear == 60;
		if (leapYear && dayOfYear > 60) {
			dayOfYear--;
		}
		// At this point, on a leap year, dayOfYear is (according to the gregorian calendar) one LESS than correct
		// But we all know St Tibs Day isn't a REAL day
		dayOfYear--; // It's also 1-indexed, which throws off the calculations.
		const erisianMonth = Math.floor(dayOfYear / 73);
		const dayOfMonth = dayOfYear % 73;
		const dayOfWeek = dayOfYear % 5;
		/*
		 * Remember that off-by-one correction for December 31?
		 * News flash, past me: this is a sign of an off-by-one error that affects EVERY month.
		 * On the last day of ANY month, it returns "day 00 of <next month>" instead.
		 * Well, I finally tracked the problem down: JS Date objects are brain-dead. Arguably, so am I.
		 * SOME of the values are 1-indexed, SOME are 0-indexed. I didn't correct properly.
		 * And I'd never noticed until August 07, when I saw "00 Bcy" in my ddate line, because it ONLY
		 * happens on the LAST day of each discordian month.
		 * The solution was to decrease dayOfYear by one to make it zero-indexed, so that ALL of the calculations
		 * are. The return object just adds one to the raw numbers to return a one-indexed value for humans.
		*/
		const yourDate = {
			year,
			month: erisianMonth + 1,
			day: dayOfMonth + 1,
			monthName: MONTHS[erisianMonth],
			shortMonthName: MONTHS[erisianMonth].replace(/^the\s+/ui, ''),
			dayName: DAYS_OF_WEEK[dayOfWeek],
			dayOfWeek: dayOfWeek + 1,
			tibs: false,
		};
		const key = `holydays.${yourDate.monthName}.#${yourDate.day}`;
		yourDate.holyDay = cfg.get(key, false);
		if (tibsDay) {
			yourDate.day = 59.5;
			yourDate.dayName = "St. Tib's Day";
			yourDate.tibs = true;
			yourDate.dayOfWeek = 0;
			yourDate.holyDay = false;
		}
		yourDate.monthNameAbbrev = ABBREV[yourDate.monthName];
		yourDate.dayNameAbbrev = ABBREV[yourDate.dayName];
		return yourDate;
	}
	format(fmtString) {
		if (fmtString && typeof fmtString != 'string') {
			fmtString = String(fmtString);
		}
		if (!fmtString) {
			fmtString = cfg.get('format', '');
		}
		const erisia = this.fnord;
		return fmtString // HERE WE GO, FELLAS
			.replace(/%([#^]?)h/gu, '%$1b')
			.replace(/%([-_0]?)F/gu, '%Y-%$1m-%$1d')
			.replace(/%e/gu, '%_d')
			.replace(/%([-_0]?)D/gu, '%$1m/%$1d/%y')
			.replace(/%\[(.*?)%\]/gu, erisia.holyDay ? '$1' : '')
			.replace(/%\((.*?)%\)/gu, erisia.holyDay ? '' : '$1')
			.replace(/%\{(.*?)%\}/gu, erisia.tibs ? "St. Tib's Day" : '$1')
			.replace(/%([-_0#^]?)([AaBbntHLCdjmuWyY])/gu, mapSpecifier.bind(mapSpecifier, erisia))
			.trim();
	}
	clone() {
		return new DDate(this);
	}
	toString() {
		return this.format();
	}
	static from(year, month, day) {
		if (typeof year == 'object') {
			day = year.day || day || 1;
			month = year.month || month || 1;
			year = year.year || new Date().getFullYear() + 1166;
		}
		year = year || new Date().getFullYear() + 1166;
		month = month || 1;
		day = day || 1;
		switch (String(month).toLowerCase()) {
			case 'chaos':
				month = 1;
				break;
			case 'discord':
				month = 2;
				break;
			case 'confusion':
				month = 3;
				break;
			case 'bureaucracy':
				month = 4;
				break;
			case 'the aftermath':
			case 'aftermath':
				month = 5;
				break;
			default:
				month = parseInt(month, 10);
				if (isNaN(month) || month < 1 || month > 5) {
					return null;
				}
				break;
		}
		day = parseInt(day, 10);
		if (isNaN(day) || day < 1 || day > 73) {
			return null;
		}
		year = parseInt(year, 10);
		if (isNaN(year)) {
			return null;
		}
		// By here, we have a one-indexed `month` of the year, a one-indexed `day` of the month, and a `year`
		// They're all erisian values, but that's the whole point of this conversionator
		const boringYear = year - 1166;
		let dayOfYear = day + (month - 1) * 73;
		const leapYear = (
			(boringYear % 100 == 0)
			&& (boringYear % 400 == 0)
		)
		|| (
			(boringYear % 4 == 0)
			&& (boringYear % 100 != 0)
		);
		if (leapYear && day == 59.5) {
			// Shortcut!
			return new Date(year, 1, 29);
		}
		if (leapYear && (day >= 60 || month > 1)) {
			// Account for that motherfucker Tib and his damned day that isn't real
			dayOfYear++;
		}
		/*
		 * I'd like to take a moment here to talk about the Gregorian calendar.
		 * Specifically, why I fucking hate it.
		 *
		 * See, the Erisian calendar actually makes a reasonable amount of sense.
		 * /Every/ month has 73 days. Always. St Tib's Day isn't part of the actual year, which
		 * does admittedly take a little getting used to, but it means that you don't need to adjust
		 * based on what month it is. If you need to do date math, you don't have to check the month
		 * in order to correct the number of days it has. You just use the magic number 73.
		 *
		 * BUT THE /GREGORIAN/ CALENDAR. Oh no, THIS motherfucker has the most bullshit layout.
		 * 31, then 28 - except it's 29 for leap years - then 31, it alternates 30/31 a few times,
		 * AND THEN! SURPRISE, MOTHERFUCKER. Two in a row with 31! Then it's back to alternating again...
		 * and then the last one has 31, just like the first. Can't even keep the high/low alternation
		 * smooth and consistent. Halfway through, you just double up on the highs. I can never
		 * actually remember how many days in a given month past like /maybe/ April because of
		 * this stupid fucking bullshit.
		 *
		 * PSD is not my favourite file format, and Gregorian is not my favourite calendar.
		 */
		return new DDate(new Date(boringYear, 0, dayOfYear));
		/*
		 * Thankfully, the javascript Date constructor can handle that fuckery for me.
		 */
	}
}

if (module.parent) {
	module.exports = DDate;
}
else {
	// Command line time!
	const opts = {
		help: false,
		short: cfg.get('cli.shortOutput', false),
		format: '',
		source: '',
		debug: false,
		live: 0,
	};
	const args = process.argv.slice(2);
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		// Manual processing time...
		if (arg.match(/^-+d(?:ate)?=?/u)) {
			const [
				key,
				val,
			] = arg.split('=');
			if (val) {
				opts.source = val;
			}
			else if (args[i + 1]) {
				opts.source = args[++i];
			}
			else {
				console.error(`Option '${key}' requires a value, but none was provided`);
				opts.help = true;
			}
		}
		else if (arg.match(/^-+f(?:mt|ormat)?=?/u)) {
			const [
				key,
				val,
			] = arg.split('=');
			if (val) {
				opts.format = val;
			}
			else if (args[i + 1]) {
				opts.format = args[++i];
			}
			else {
				console.error(`Option '${key}' requires a value, but none was provided`);
				opts.help = true;
			}
		}
		else if (arg.match(/^-+s(?:hort)?$/u)) {
			opts.short = true;
		}
		else if (arg.match(/^-+l(?:ong)?$/u)) {
			opts.short = false;
		}
		else if (arg.match(/-+h(?:elp)?$/u)) {
			opts.help = true;
		}
		else if (arg.match(/^-+D(?:ebug)?$/u)) {
			opts.debug = true;
		}
		else if (arg.match(/^-+L(?:ive)?=?/u)) {
			const [
				key,
				val,
			] = arg.split('=');
			let lifetime = 60;
			if (val) {
				lifetime = val;
			}
			else if (args[i + 1]) {
				lifetime = args[++i];
			}
			if (lifetime) {
				const [
					count,
					unit,
				] = String(lifetime)
					.match(/^(\d+)\s*([a-z]?)$/ui)
					.slice(1);
				switch (unit) {
					case '':
					case 's':
						opts.live = count;
						break;
					case 'm':
						opts.live = count * 60;
						break;
					case 'h':
						opts.live = count * 60 * 60;
						break;
					default:
						console.error(`Option '${key}' was given a bad value - the unit '${unit}' is unknown`);
						opts.help = true;
				}
			}
			else {
				console.error(`Option '${key}' requires a value, but none was provided`);
				opts.help = true;
			}
		}
	}
	if (opts.help) {
		/* eslint-disable max-len */
		console.log([
			`Usage: ${process.argv[1]} [--format <format>] [--date <date>]`,
			"--format --fmt -f",
			"       Specify the output format according to the following section",
			`       (If omitted, will default to '${cfg.get('format', '')}' according to your current configuration)`,
			"--date -d",
			"       Specify the date to convert (in a format understood by javascript's `new Date()` constructor)",
			"       You can also use the magic string 'tomorrow' for this.",
			"       (If omitted, will default to the current day)",
			"--short -s",
			"       Omit the thuddite date from the output (if your date isn't properly understood, you'll have no warning!)",
			"--long -l",
			"       Include the thuddite date in the output (undoes the --short option)",
			"--Live -L",
			"       Do not exit, produce live-updating output every specified interval, defaulting to one minute",
			"       The interval is in the format `<number>[<unit>]` where <unit> is one of the following:",
			"           s - seconds",
			"           m - minutes",
			"           h - hours",
			"       This option ignores the --date origin option; it only outputs the current Erisian date each update.",
			"       This option forces short output mode, regardless of flags or user configuration.",
			"The --short and --long options override each other; whichever comes last will take effect.",
			"Since I wrote the option handling manually, you can't bundle options. Price of not having a library for it, sorry.",
			"Date formatting uses the (mostly sanely) applicable specifiers from date(1):",
			"   %A - full name of weekday (includes `St. Tib's Day`)",
			"   %a - short name of weekday (includes St. Tib's Day as `St Tib`)",
			"   %B - full name of month",
			"   %b - short name of month",
			"   %C - century",
			"   %d - day of month (always [1, 73])",
			"   %D - identical to `%m/%d/%y`",
			"   %e - identical to `%_d`",
			"   %F - identical to `%Y-%m-%d`",
			"   %h - identical to `%b`",
			"   %j - day of year (always [1, 365] - St. Tib's Day is not a real day for this purpose)",
			"   %m - month, numeric and one-indexed (always [1, 5] - 1 is Chaos)",
			"   %m - month, numeric and zero-indexed (always [0, 4] - 0 is Chaos)",
			"   %n - newline",
			"   %t - tab",
			"   %u - day of week, numeric and one-indexed (always [1, 5] - 1 is Sweetmorn)",
			"   %W - day of week, numeric and zero-indexed (always [0, 4] - 0 is Sweetmorn)",
			"   %y - last two digits of the year",
			"   %Y - full year (equivalent to `%C%y` for four-digit years and shorter)",
			"Additionally, the following new specifiers have been added:",
			"   %H - the name of the current Holy Day, if there is one; if not, it will not be touched (St. Tib's Day, not being a real day, does not count)",
			"   %[<text>%] - only renders the contents if it is a Holy Day",
			"   %(<text>%) - the opposite of `%[<text>%]`, only renders the contents if it is NOT a Holy Day",
			"   %{<text>%} - only renders the contents if it is NOT St. Tib's Day, otherwise it will be replaced with `St. Tib's Day`",
			"The following extra specifiers may be used between the `%` character and the format code:",
			"   `-` will not pad the field",
			"   `_` will pad with spaces, not zeros",
			"   `0` will pad with zeros (the default)",
			"   `^` will use uppercase",
			"   `#` will use lowercase",
			"The first three apply only to numbers, the last two apply only to strings. You can only use one.",
		].join("\n"));
		/* eslint-enable max-len */
	}
	else if (opts.debug) {
		const fmt = opts.format
			? chalk.green(opts.format)
			: chalk.cyan(cfg.get('format', chalk.red('-null-')));
		const origin = opts.source
			? chalk.green(getOriginDate(opts.source).toString())
			: chalk.cyan(new Date().toString());
		const short = chalk.bold.blue(String(opts.short));
		const updating = opts.live
			? chalk.bold.blue(`${opts.live} seconds`)
			: chalk.magenta('false');
		console.log([
			"-----DEBUG-----",
			`Current format: [${fmt}]`,
			`Current origin: [${origin}]`,
			`Short output:   [${short}]`,
			`Live updates:   [${updating}]`,
		].join("\n"));
	}
	else if (opts.live) {
		// Set an update interval, and gracefully terminate it to exit normally on SIGHUP/SIGINT
		const cycle = process.stdout.isTTY
			? require('log-update')
			: null;
		const display = () => {
			const output = new DDate().format(opts.format);
			if (cycle) {
				cycle(`${output}\n`);
			}
			else {
				console.log(output);
			}
		};
		const interval = setInterval(display, 1000 * opts.live);
		display();
		const abort = () => {
			clearInterval(interval);
			if (cycle) {
				cycle.clear();
			}
			process.exitCode = 0;
		};
		process.on('SIGHUP', abort);
		process.on('SIGINT', abort);
		process.on('SIGPIPE', abort);
		process.on('SIGTERM', abort);
		process.on('SIGQUIT', abort);
	}
	else {
		const origin = getOriginDate(opts.source);
		const hail = new DDate(origin);
		let output = '';
		if (!opts.short) {
			output += `${origin.toLocaleDateString(void 0, cfg.get('localeFormatOptions', {}))} is `;
		}
		output += hail.format(opts.format);
		console.log(output);
	}
}

