# @princessrtfm/ddate

`ddate` is a library and commandline utility for converting from boring Thuddite dates to proper Erisian ones.

## Features

- Can be `require()`d as a library to do your own conversions
- User configurable (via the [conf module](https://www.npmjs.com/package/conf), but you have to find the file yourself right now)
- Reasonably simple command line interface, manually implemented for no option handling dependencies
- From the library (not commandline), you can convert back from Erisian to Gregorian
- Almost definitely 100% accurate, probably!

### _Planned_ Features

- A test suite for every single day of the year (I'd like to _guarantee_ that 100% accuracy)
- Try for backwards-compatibility with the old `ddate` utility's interface (what even _is_ the old `ddate`'s CLI?)
- More advanced date parsing (I am _not_ writing this manually, so it'll be an optional dependency)

## Installation

Install via npm with `npm i @princessrtfm/ddate`. Add the `-g` flag to install globally if you want to run it from anywhere. You should definitely want to run it from anywhere.

## Commandline Usage

This is absolutely not a drop-in replacement for the old `ddate` utility. It has a clear and relatively simple interface, which can be further customised through the user configuration and the command line flags, but I couldn't fit the neatness of this into the old style. Yet. We'll see what I can do.

At present, the configuration file is managed via the [conf module](https://www.npmjs.com/package/conf), and you have to hand-edit it until I write a configurator. I recommend using a JSON-aware IDE. The settings are listed below. The command line flags are also listed below, but higher.

- `--date` `-d`

	Allows you to specify the (anerisian) date to convert. At present, it needs to be a format that `new Date()` will understand, which means that Unix timestamps need to be converted to measure *milli*seconds.

	Alternatively, starting with version 1.1.0 (technically, since commit bd45cbb on 2020-07-20) you can use ISO 8601, which is loosely parsed. It should be the four-digit year, the one-or-two-digit month, and then the one-or-two-digit day; the separator may be a hypen or any (singular) whitespace character.

- `--format` `--fmt` `-f`

	Allows you to specify a particular output format for the Erisian date, according to the Format Specifiers section below.

- `--short` `-s`

	Flags for short output, which will hide the boring Thuddite date in the output. Only the Erisian date (according to your format string) will be printed.

- `--long` `-l`

	Flags for long output, which will prefix the Erisian date (according to your format string) with the anerisian date being converted. The anerisian date will be output via `toLocaleDateString()` with the `localeFormatOptions` in your configuration file.

- `--Live` `-L`

	Flags for live output, which keeps the script running and updates the output occasionally. You can provide an update delay yourself if you want, as a number followed by a letter: `s` for seconds (the default with no unit), `m` for minutes, and `h` for hours. If you don't provide a delay, the default is every minute. When running in a terminal (STDOUT is a TTY) the update will rewrite itself each time; otherwise the output will be a new line every time.

	The `--date`/`-d` option is ignored when using live update mode, since it wouldn't make any sense. Live update mode recalculates the erisian date every time it updates the output, since not doing that would be pointless and weird.

## Library Usage

When you `require('@princessrtfm/ddate')`, the returned value is the `DDate` class. There are two ways to instantiate it: the normal constructor (`new DDate(...)`), and `DDate.from(...)`.

### Construction

There are two ways to create a new `DDate` object, depending on what kind of initial date representation you have. If you have a Gregorian representation or an existing `DDate` object to clone, use the standard constructor. If you have an Erisian representation, use `DDate.from(...)` instead.

#### `new DDate(...)`

Accepts a single argument, which can be any of the following (and will be checked in this order):

- a `DDate` object (according to `instanceof`)

	The internal `Date` object will be _copied_ to the new object from the given one. Changing one **will not** affect the other.

- a `Date` object (according to `instanceof`)

	The internal `Date` object will be _set to_ the given one. Changing one **will** affect the other.

- a `number` or a `string` (according to `typeof`)

	The internal `Date` object will be constructed by passing the given value to `new Date()`

- `undefined` (according to `typeof`)

	The internal `Date` object will be initialised with no argument, making it represent the current date at the moment of construction

#### `DDate.from(...)`

Accepts one to three arguments. Simple invocation takes the arguments `year, month, day` (in order); as an alternative, you can pass a single object in the first place with `year`, `month`, and `day` properties. Any values that aren't [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) (including entirely omitted ones) will be set automatically: `day` and `month` to `1`, and `year` to the current year. You can pass the month name as a string (case-insensitive, and `aftermath` is equivalent to `the aftermath`) or as a number where `1` is Chaos. If any of the given values cannot be recognised or are out of range, `null` will be returned. Otherwise, a new `DDate` object will be returned, representing the given Erisian date.

If you have a regular `Date` that you want to use, you should either pass it to the `new DDate(...)` constructor, or (if you don't want to use the same object) you can pass `dateObject.getTime()` instead to clone it.

### Methods and Properties

#### `.thuddite`

A magic (getter/setter) property to interact with the internal (Gregorian) representation. The constructor is internally implemented by passing whatever value it's given directly to `this.thuddite`'s setter, so any values listed in the constructor section above are valid and will set the internal Gregorian representation accordingly. The getter guarantees that an internal representation exists on access, and returns the actual object - using `Date`'s mutator methods on it **will** affect the `DDate` object.

If you want a copy of the internal `Date` object, consider calling `.clone()` first, or use any of the common methods of cloning a `Date` object.

#### `.fnord`

A magic (getter-only) property to get a generic object describing this Erisian date. Probably not that commonly needed, mostly used internally by the `.format()` method, but the returned object is described below.

#### `.format(formatString)`

Returns a string representation of this Erisian date, according to the given `formatString`. If no `formatString` is provided, the default defined in your user configuration file is used instead - see the Configuration File section below.

#### `.toString()`

Calls `.format()` with no `formatString`. Provided for convenience when you like the default (or have customised things yourself) enough to not care about setting one yourself.

#### `.clone()`

Returns a new `DDate` object, initialised to the same date as the original but with a separate internal `Date` object. Changing one **will not** affect the other.

### The `.fnord` Property

When reading the `.fnord` property of any `DDate` object, the Erisian date is calculated from the internal representation and an object describing it is returned. The following properties are **guaranteed** to exist.

- `.year` - the Erisian year
- `.month` - the numeric Erisian month, where `1` is Chaos
- `.day` - the numeric day of the Erisian month
- `.monthName` - the name of the Erisian month, in Title Case (The Aftermath _does_ include the `The` in the front)
- `.dayName` - the name of the Erisian day of the week, in Title Case (Prickle-Prickle includes the `-` and both of the letter `P` are capitalised)
- `.dayOfWeek` - the numeric day of the week, where `1` is Sweetmorn
- `.holyDay` - the name of the current Holy Day (see the `holydays` setting in the Configuration File section for details) if one was found for today, or boolean `false` if it is not a Holy Day
- `.tibs` - a boolean indicating whether it is St. Tib's Day (if `true`, then: `.day == 59.5`, `.dayName == "St. Tib's Day"`, `.dayOfWeek == 0`, and `.holyDay == false` - St. Tib's Day is not a real day)

## Format Specifiers

Date formatting uses the (mostly sanely) applicable specifiers from date(1):

- `%A` - full name of weekday (includes `St. Tib's Day`)
- `%a` - short name of weekday (includes St. Tib's Day as `St Tib's`)
- `%B` - full name of month
- `%b` - short name of month
- `%C` - century
- `%d` - day of month (always [1, 73])
- `%D` - identical to `%m/%d/%y`
- `%e` - identical to `%_d`
- `%F` - identical to `%Y-%m-%d`
- `%h` - identical to `%b`
- `%j` - day of year (always [1, 365] - St. Tib's Day is not a real day for this purpose)
- `%m` - month, numeric and one-indexed (always [1, 5] - 1 is Chaos)
- `%M` - month, numeric and zero-indexed (always [0, 4] - 0 is Chaos)
- `%n` - newline
- `%t` - tab
- `%u` - day of week, numeric and one-indexed (always [1, 5] - 1 is Sweetmorn)
- `%W` - day of week, numeric and zero-indexed (always [0, 4] - 0 is Sweetmorn)
- `%y` - last two digits of the year
- `%Y` - full year (equivalent to `%C%y` for four-digit years and shorter)

Additionally, the following new specifiers have been added:

- `%H` - the name of the current Holy Day, if there is one; if not, it will not be touched (St. Tib's Day, not being a real day, does not count)
- `%[<text>%]` - only renders the contents if it is a Holy Day
- `%(<text>%)` - the opposite of `%[%]`, only renders the contents if it is _not_ a Holy Day
- `%{<text>%}` - only renders the contents if it is NOT St. Tib's Day, otherwise it will be replaced with `St. Tib's Day`

The following extra specifiers may be used between the `%` character and the format code:

- `-` will not pad the field
- `_` will pad with spaces, not zeros
- `0` will pad with zeros (the default)
- `^` will use uppercase
- `#` will use lowercase
The first three apply only to numbers, the last two apply only to strings. You can only use one.

## Configuration File

The file itself is wherever the [conf module](https://www.npmjs.com/package/conf) puts it on your system. If you haven't customised your XDG folders, that should be in `~/.config/@princessrtfm/ddate-nodejs/config.json`. Until I can put together a configurifier utility, you'll have to change things by hand. You can delete the file to regenerate the original config, in case Something Bad happens.

### Settings

- `format`: the default output format for the Erisian date, if none is provided (also applies to library calls not using a format, so don't do that)
	- The default value is `%{%A, %d %B%}%[ (%H)%], %Y Year of Our Lady Discord`, to produce output like `Setting Orange, 05 Chaos (Mungday), 3185 Year of Our Lady Discord`
- `holydays`: a mapping of wholly days that you observe, or that you despise, or that you want your friends to see until they figure out how to remove this utility, or for any other reason
	- The value of `holydays.<month>.#<day>` will be displayed on `<day>` of `<month>` in conversions, assuming the pattern contains the appropriate specifier. The `<month>` is the _name_ of the month, in Title Case, and includes all relevant spaces. The `<day>` is the _number_ of the day of the month, and the `#` is required.
	- You can delete the entire `holydays` section to get back the defaults, in case something breaks. This will _not_ regenerate the other sections and values.
	- By default, only the standard holy days will be included. If you want to add your own wholly days, you'll need to do that yourself.
- `localeFormatOptions`: the options to be passed to `toLocaleDateString()` in non-short output mode for displaying the thuddite date that is being fixed
	- By default, it will output the longest locale-formatted string possible. If you want to change that, make sure the values are valid according to [the MDN docs for `toLocaleDateString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString).
	- The `locale` argument is always `undefined`, to use the current system locale. Everything else is written in English because that's all I speak. If you're using a non-English locale, I hope you consider this is a pleasantly chaotic surprise.
- `cli`: values that apply _only_ the the CLI invocation, not to any library calls
	- `cli.shortOutput`: if `true`, acts as though the `--short` flag was given, unless the `--long` flag actually _is_ given, in which case this is ignored

