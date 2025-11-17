import LanguageDetect from 'languagedetect';
const lngDetector = new LanguageDetect();
 
// OR
// const lngDetector = new (require('languagedetect'));
 
console.log(lngDetector.detect(`🫶🫶🫶`));
 
/*
  [ [ 'english', 0.5969230769230769 ],
  [ 'hungarian', 0.407948717948718 ],
  [ 'latin', 0.39205128205128204 ],
  [ 'french', 0.367948717948718 ],
  [ 'portuguese', 0.3669230769230769 ],
  [ 'estonian', 0.3507692307692307 ],
  [ 'latvian', 0.2615384615384615 ],
  [ 'spanish', 0.2597435897435898 ],
  [ 'slovak', 0.25051282051282053 ],
  [ 'dutch', 0.2482051282051282 ],
  [ 'lithuanian', 0.2466666666666667 ],
  ... ]
*/
 
// Only get the first 2 results
//console.log(lngDetector.detect('This is a test.', 2));
 
/*
  [ [ 'english', 0.5969230769230769 ], [ 'hungarian', 0.407948717948718 ] ]
*/