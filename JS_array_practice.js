const students = [
    "John",
    "Peter",
];
console.log(students)


for (let student of students) {
        console.log(student);
}

let arrAges = [20, 30, 40, 50, 60];
let arrAge_1 = arrAges;

//arrAge_1 = [15,20];

arrAge_1[0] = 100

console.log(arrAges);
console.log(arrAge_1);