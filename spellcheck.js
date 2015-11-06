#! /usr/bin/env node

//executed with Node.js - 'node spellcheck.js'
//require statments
var fs = require('fs');
var readline = require('readline');

//edit first argument depending on location of dictionary file
var input = fs.readFileSync('/usr/share/dict/words', 'utf8');
//create array based on line delimited string input
var input = input.split('\n');
//hash for storing words for O(1) lookup/access
var dict = {};

//inital populating of hash with dictionary words
for(var i = 0; i < input.length; i++) {
  //normalize to lowercase
  var word = input[i].toLowerCase();
  dict[word] = word;
}

//use node.js readline module to access stream for reading input and writing output
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//set and display prompt
// rl.setPrompt('>');
rl.prompt();

//on line input
rl.on('line', function(input) {
  //
  console.log('Input: ' + input);
  //normalize input to lowercase
  input = input.toLowerCase();

  if(dict[input]) { //if word in dictionary, output word and prompt for next input
    console.log('Found word: ' + dict[input]);
    rl.prompt(); //if word found, re-prompt
  } else if(repeatCheck(input, false)) { //check for repeated letters only, if true output word
    rl.prompt(); //if word found, re-prompt
  } else if(vowelCheck(input, 0)) { //check for incorrect vowel(s), if true output word
    rl.prompt(); //if word found, re-prompt
  } else if(repeatCheck(input, true)) { //check for repeated letters and incorrect vowels, if true output word
    rl.prompt(); //if word found, re-prompt
  } else { //otherwise output no suggestion
    console.log('NO SUGGESTION');
    rl.prompt();
  }
}).on('close', function() { //when CLI closed, exit and send closing message
  console.log('Thanks for using SpellCheck!');
  process.exit(0);
});

//helper function to check for repeated letters
var repeatCheck = function(input, vowels) {
  for(var j = 0; j < input.length; j++) { //iterate through input word
    if(input[j] === input[j+1]) { //if repeated character found
      input = input.substring(0, j) + input.substring(j+1); //remove
      if(vowels) { //if simultaneously checking for incorrect vowels
        if(vowelCheck(input, 0)) { //check for incorrect vowels and return true if word found
          return true;
        }
      }
      j--; //adjust word length
    }
    if(dict[input]) { //if found in dictionary, output word
      console.log('Found word: ' + dict[input]);
      return true;
    }
  }
  return false; //return false if no match found
};

//helper function to check for incorrect vowels
var vowelCheck = function(input, index) {
  var vowels = ['a','e','i','o','u']; //vowel list

  for(var j = index; j < input.length; j++) { //iterate through input word
    if(vowelTest(input[j])) { //if letter is vowel
      var temp = input[j]; //temp variable to hold original vowel
      for(var x = 0; x < vowels.length; x++) { //iterate through vowel list
        input = input.substring(0, j) + vowels[x] + input.substring(j+1); //insert new vowel
        if(dict[input]) { //if found in dictionary, output word
          console.log('Found word: ' + dict[input]);
          return true;
        }
        if(repeatCheck(input, false)) { //check for non-vowel repeated characters in rest of input word
          return true;
        }
        if(vowelCheck(input, j+1)) { //recursively check for incorrect vowels in rest of input word
          return true;
        }
      }
      input = input.substring(0, j) + temp + input.substring(j+1); //reset input word with original vowel
    }
  }
  return false; //return false if no match found
};

//helper function to check if letter is vowel
var vowelTest = (function() {
  var regexp = /[aeiou]/; //regular expression to check if letter is vowel
  return function(letter) { //return closure so that regexp isn't built each time
    return regexp.test(letter); //test letter for vowel match
  };
})(); //IIFE
