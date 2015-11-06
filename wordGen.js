#! /usr/bin/env node

//executed with Node.js - 'node generator.js' or using 'npm link' in the module's root folder
//require statments
var child = require('child_process');
var readline = require('readline');
var spellcheck = child.spawn('node', ['spellcheck.js']);

//use node.js readline module to access stream for reading input and writing output
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//function to generate words with spelling mistakes based on word from user
var generator = function(line) {
  //spellcheck user input word
  spellcheck.stdin.write(line + '\n');

  var maxIndex = line.length - 1;
  //generate 15 total test cases
  for(var i = 0; i < 5; i++) {
    var genWord = line;
    //find and change vowels if any
    for(var j = 0; j <= maxIndex; j++) {
      var vowels = ['a','e','i','o','u']; //vowel list
      if(vowelTest(genWord[j])) {
        genWord = genWord.substring(0, j) + vowels[randomGen(vowels.length - 1)] + genWord.substring(j + 1);
      }
    }
    //pipe to spellcheck program
    spellcheck.stdin.write(genWord + '\n');

    //randomly capitalize chars up to length of string
    for(var k = 0; k <= randomGen(maxIndex); k++) {
      var index = randomGen(maxIndex);
      genWord = genWord.substring(0, index) + genWord[index].toUpperCase() + genWord.substring(index + 1);
    }
    //pipe to spellcheck program
    spellcheck.stdin.write(genWord + '\n');

    //randomly insert 2 repeated characters
    for(var x = 0; x <= randomGen(maxIndex); x++) {
      var index = randomGen(genWord.length - 1);
      var repeatChars = '';

      for(var y = 0; y < 2; y++) {
        repeatChars += genWord[index];
      }
      genWord = genWord.substring(0, index) + repeatChars + genWord.substring(index + 1);
    }
    //pipe to spellcheck program
    spellcheck.stdin.write(genWord + '\n');
  }
};

//helper function to generate random number based on max argument
var randomGen = function(max) {
  return Math.floor(Math.random() * max);
};

//helper function to check if letter is vowel
var vowelTest = (function() {
  var regexp = /[aeiou]/; //regular expression to check if letter is vowel
  return function(letter) { //return closure so that regexp isn't built each time
    return regexp.test(letter); //test letter for vowel match
  };
})(); //IIFE

//on line input
rl.on('line', generator);

//pipe spellcheck output to parent process - the generator
spellcheck.stdout.pipe(process.stdout);

//check for any invalid inputs which will result in 'NO SUGGESTION' from spellcheck
spellcheck.stdout.on('data', function (data) {
  if(data.toString() === 'NO SUGGESTION\n') {
    console.log('Error - input word is not valid');
    process.exit(0);
  }
});

//close parent process if spellcheck is closed
spellcheck.stdin.on('close', function() {
  process.exit(0);
});
