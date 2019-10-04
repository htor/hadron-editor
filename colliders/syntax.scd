s.boot;

z = Convenience;

/* crawler loads folders in its way */
z.crawl

// no gui usage
z.crawl(Platform.resourceDir +/+ "sounds", depth: 0)

z.list // get some info of what went down

//minimum
z.p(\lay); // play at the beginning of first file in first folder
z.s(\lay); // stop

// play
z.p(
    \lay,
    tempo: 8.0,
    folder: \sounds,
    index: Prand([1,2,3], inf),
    pos: Pwhite(0.2,0.7),
    dur: Pseq([1,3,Rest(2),2], inf),
    rate: Pwhite(0.9,1.0) * Pstep([0.4,0.9,0.2], Prand([3,5,8], inf), inf),
    pan: Pwhite(-0.65,0.65),
    amp: 0.4
);

// slay
z.s(\lay)

Ndef.ar(\grammar, {SinOsc.ar(freq: 321, mul: 0.5)}).playN([0,1,2,3])

play{|pip=1e-3|Klang.ar(`[(_.linexp(0,2e4,99,1e4))!2e4,pip]).tanh!2}

2pi, 0.43, 0x123, 12e3, 3e-2
"attention!\n\timportant: %\n".format(item).postln;
~tilde _that symbolArg: \symb 'symb'

item.pathOnly.do{ | char, item |
    if (char == $a, {"aleph".postln});
	if (char == ($/) || (char == ($\\)), {
		item.folderName.replace(($ ),"_")
	})
};

classvar const super this arg |pipes| var false inf nil true thisFunction thisFunctionDef
thisMethod thisProcess thisThread currentEnvironment topEnvironment
linlin explin linexp expexp min max round trunc atan2 hypot hypotApx ring1 ring2 ring3
ring4 sumsqr difsqr sqrsum sqrdif absdif thresh amclip scaleneg clip2 wrap2 fold2
excess neg reciprocal abs floor ceil frac sign squared cubed sqrt exp midicps
cpsmidi midiratio ratiomidi dbamp ampdb octcps cpsoct log log2 log10 sin cos tan
asin acos atan sinh cosh tanh distort softclip isPositive isNegative isStrictlyPositive
new yield break rescue return case begin do forBy loop if while else
.play play{} .scope scope{} .plot plot{} .playN .asBuffer

// singleline comment
/* multiline comment (or block by some) */
