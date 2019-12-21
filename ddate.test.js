const tap = require('tap');
const DDate = require('.');

// No touchy ANY of these values - they're specifically set to 2019-12-09T05:04:38.690Z (because that's when I started writing this test)
tap.context.fromNothing = new DDate();
tap.context.fromNumber = new DDate(1575867878690);
tap.context.fromString = new DDate('2019-12-09T05:04:38.690Z');
tap.context.plainDate = new Date(1575867878690);
tap.context.fromPlainDate = new DDate(tap.context.plainDate);
tap.context.fromErisianDate = new DDate(tap.context.fromPlainDate);
tap.context.fromClone = tap.context.fromErisianDate.clone();
// All of these dates (standard and Erisian) SHOULD represent the same time, except for `fromNothing`

tap.test('object creators', async t => {
	const checkObject = (obj, source) => {
		if (!obj || !(obj instanceof DDate)) {
			const stringed = Reflect.apply(Object.prototype.toString, obj, []);
			const error = `${source} produced ${stringed} instead of DDate instance`;
			t.bailout(new TypeError(error));
		}
		else {
			t.pass(`${source} produces a DDate instance`);
		}
	};
	checkObject(t.context.fromNothing, 'empty constructor call');
	checkObject(t.context.fromNumber, 'constructor call with number');
	checkObject(t.context.fromString, 'constructor call with javascript Date-formatted string');
	checkObject(t.context.fromPlainDate, 'constructor call with standard Date object');
	checkObject(t.context.fromErisianDate, 'constructor call with another DDate object');
	checkObject(t.context.fromClone, 'call to instance.clone()');
});
tap.test('internal Date object', async t => {
	t.ok(t.context.fromNumber._thuddite, 'constructor call with number has internal object');
	t.same(t.context.fromNumber._thuddite, t.context.fromString._thuddite, 'matching number and string constructor calls produce matching dates');
	t.isNot(t.context.fromNumber._thuddite, t.context.fromString._thuddite, 'matching number and string constructor calls do NOT produce the same object');
	t.is(t.context.fromNothing._thuddite, t.context.fromNothing.thuddite, 'internal getter returns the right object');
	t.is(t.context.fromPlainDate.thuddite, t.context.plainDate, 'constructor call with Date wraps the given object');
	t.isNot(t.context.fromErisianDate.thuddite, t.context.fromPlainDate.thuddite, 'constructor call on DDate object clones the internal date');
	t.same(t.context.fromErisianDate.thuddite, t.context.fromPlainDate.thuddite, 'constructor call on DDate object returns equivalent clone of internal date');
});
tap.test('date conversion', async t => {
	const fnord = Object.freeze(t.context.fromClone.fnord);
	const formatted = t.context.fromClone.format('[%A] [%a] [%B] [%b] [%C] [%d] [%j] [%m] [%n] [%t] [%u] [%W] [%y] [%Y]');
	t.is(fnord.year, 3185, '2019 CE (GRE) is 3185 YOLD');
	t.is(fnord.monthName, 'The Aftermath', 'December is in The Aftermath');
	t.is(fnord.month, 5, 'The Aftermath is month #5');
	t.is(fnord.day, 51, 'December 9 is 51 The Aftermath');
	t.is(fnord.dayName, 'Pungenday', '51 The Aftermath is Pungenday');
	t.is(fnord.dayOfWeek, 3, 'Pungenday is the third day of the week');
	t.is(fnord.tibs, false, "51 The Aftermath is not St. Tib's Day");
	t.is(formatted, "[Pungenday] [PD] [The Aftermath] [Afm] [31] [51] [343] [5] [\n] [\t] [3] [2] [85] [3185]", 'string formatting returns the right values');
});
tap.test('modifying internal date objects', async t => {
	const d = t.context.fromNothing;
	const i = d.thuddite;
	i.setFullYear(2020);
	i.setMonth(1);
	i.setDate(29);
	const fnord = d.fnord;
	const formatted = d.format('[%A] [%a] [%B] [%b] [%C] [%d] [%j] [%m] [%n] [%t] [%u] [%W] [%y] [%Y]');
	const expected = "[St. Tib's Day] [St Tib] [Chaos] [Chs] [31] [59.5] [59.5] [1] [\n] [\t] [0] [0] [86] [3186]";
	t.is(fnord.year, 3186, '2020 CE (GRE) is 3186 YOLD');
	t.is(fnord.monthName, 'Chaos', 'February is in Chaos');
	t.is(fnord.month, 1, 'Chaos is month #1');
	t.is(fnord.day, 59.5, "St. Tib's Day is the 59.5th day");
	t.is(fnord.dayName, "St. Tib's Day", "St. Tib's Day is St. Tib's Day");
	t.is(fnord.dayOfWeek, 0, "St. Tib's Day is outside of the week");
	t.is(fnord.tibs, true, "59.5 Chaos is St. Tib's Day");
	t.is(formatted, expected, 'string formatting returns the right values');
});

