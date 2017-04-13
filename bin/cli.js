#!/usr/bin/env node

var
  argv = require('minimist')(process.argv.slice(2)),
  istanbulDiff = require('../lib/index.js'),
  fs = require('fs'),
  depth = argv.depth,
  pick = argv.pick,
  args = argv._;

// console.log(argv, depth);

if (args.length !== 2) {
  console.log('USAGE: \n  istanbul-diff coverage-summary-before.json coverage-summary-after.json');
  console.log('Options:');
  console.log('  --depth <n>    diff to depth n');
  console.log('  --pick <t>     pick out <t> diff, e.g. lines.pct (comma separated)');
  console.log('  --lines        include linesCovered');
  console.log('  --json         output json diff (always exits successfully)');
  console.log('  --detail <w>   detailed report. <w>=lines,statements,functions,branches or blank for all');
  console.log('  --nomotivate   disabling compliment, or not!');
  console.log('  --nocolor      disable colorized output');
  console.log('  --nofail       do not exit with code 1 if coverage decreases');
  console.log('  --recurse      recurse through sub folders (up to depth), otherwise print only root');
  console.log('  --brief        suppress no-change messages');
  return;
}

if (pick) {
  pick = pick.split(',');
}

var fileLeft = args[0],
  fileRight = args[1],
  options = {
    ignoreLinesCovered: !argv.lines,
    depth             : depth,
    pick              : pick,
    nomotivate        : argv.nomotivate,
    detail            : !pick && argv.detail, // pick and detail don't work well together
    nocolor           : argv.nocolor,
    recurse           : argv.recurse,
    brief             : argv.brief
  },
  left = JSON.parse(fs.readFileSync(fileLeft)),
  right = JSON.parse(fs.readFileSync(fileRight)),
  delta = istanbulDiff.diff(left, right, options),
  result;
// console.log(delta)

if (argv.json) {
  console.log(delta);
} else {
  result = istanbulDiff.print(delta, options);
  console.log(result.msg);

  if (options.motivate && options.detail === true) {
    console.log(istanbulDiff.print.compliment(!result.regressed));
  }
  if (!argv.nofail && result.regressed) {
    process.exit(1);
  }
}
