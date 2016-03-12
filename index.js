'use strict';

/*
    So what do you do when you're stuck somewhere, a couple of days after International Woman's
    Day, don't know anyone, have been reading and watching gender, race, and culture realted media
    for the past few days, and have no access to any kind of psychological enhancements.

    You write a gender wage gap simulator. Probably a highly inacurate one, but hey, at least I'm
    doing something right?

    I've commented the code as much as I thought would be good enough.

    DISCLAIMER:

    This is either a work of fiction or a work or reality depending on your views and what kind of numbers
    you put in to the sytem before letting it run. In either case, this is not be used to prove a point.
    Because it has not been officially commissioned by any government. Furthermore, you may only use and look at
    this code at your own risk. If you have no sense of humour I suggest you CMD+W (if you're on Windows then
    shame on you!!).

    ,:d88b:.
   d8P~''~Y8b
  :8P      Y8:            8888888
  [8|      |8]              ,d888
  :8b      d8;            ,d8P~88
   Y8b.__,d8P    ,:d88b;,88P'  88 
    `~Y88P"^    d8P~''~Y8b~
       88      :8P      Y8:
       88      [8|      |8]
   [88888888]  :8b      d8;  
       88       Y8b.__,d8P
       88        `~Y88P"^
       Y8

    Acknowledgements: ASCII gender art courtesy of googling for ascii gender art.

    License: MIT.
*/

var _ = require('lodash');

const make_symbol_map = (array) => _.reduce(
    array,
    (map, val) => (map[val] = Symbol(val)) && map, 
    {}
);

const AverageType = make_symbol_map(['Mean', 'Median']);

// ======================================================================
//
// Options that can be changed follow:
//
// ======================================================================

const ITERATIONS = 100; // Number of iterations that will be used to calculate averages
const AVERAGE_TYPE = AverageType.Median;
/*
    The following structure is what the algorithms use to calculate the stats. Each object may have the
    following properties:

    * TotalPeople: Total number of people in the industry (duh)
    * MaleToFemaleRation: How many males there are per female (duh again)
    * MinSalary: Minimum expected salary in the industry (also duh, way to go for self documenting code eh?)
    * MaxSalary: Maximum expected salary in the industry (why I keep on doing this is beyond me)
    * FemaleEqualityFactor: How much compoared to men do women make. 1 = same. 0.5 = half of men, for eg.
*/
const Industries = {
    MakingRainbows: {
        TotalPeople: 7,
        MaleToFemaleRatio: '1:1',
        MinSalary: 110,
        MaxSalary: 190,
        FemaleEqualityFactor: 1,
    },
    DrowningPoliticians: {
        TotalPeople: 1000,
        MaleToFemaleRatio: '1:1',
        MinSalary: 700,
        MaxSalary: 900,
        FemaleEqualityFactor: 1,
    },
    BeingAwesome: {
        TotalPeople: 4,
        MaleToFemaleRatio: '1:1',
        MinSalary: 180,
        MaxSalary: 260,
        FemaleEqualityFactor: 1,
    },
};


// ======================================================================
//
// The code now follows. Please handle with care. I spent a whole couple
// of hours just fiddling with function names and trying to decide
// whether or not I should calculate the male stuff first or the female
// stuff first, until I thought... what the fuck is wrong with me...
// After which I ... lost track of my thoughts.
//
// ======================================================================

// Utility functions. Is cool functional stuff.
const sum = (count, what) => _.sumBy(_.range(count), what);
const sum_average = (count, what) => sum(count, what) / count;
const mid_index = (array) => _.floor(array.length / 2);
const is_even = (n) => n % 2 === 0;
const mid_or_average = (array, mid) => is_even(array) 
        ? (array[mid - 1] + array[mid]) / 2
        : array[mid];
const median = (array) => mid_or_average(_.sortBy(array), mid_index(array));
const average = AVERAGE_TYPE === AverageType.Mean ? _.mean : median;
const percentage_change = (a, b) => (a - b) / a;
const wage_gap = (male_earnings, female_earnings) => percentage_change(male_earnings, female_earnings);
const percent = (n) => (n * 100).toFixed(2);

//
// This function operates per industry that was described above. It is the meat of the program.
//
function map_indsutry_data(data, industry) {
    const parts = data.MaleToFemaleRatio.split(':');

    const male_parts = +parts[0]; // heh heh
    const female_parts = +parts[1]; // heh heh heh
    const total_parts = female_parts + male_parts; // it's an orgy!
    const female_count_factor = female_parts / total_parts;

    const total_females = _.floor(data.TotalPeople * female_count_factor);
    const total_males = data.TotalPeople - total_females;

    console.log(`For industry ${industry}:`)
    console.log(`  ${data.TotalPeople} total people`);
    console.log(`  ${total_males} total males`);
    console.log(`  ${total_females} total females`);

    var equality_dance = (min, max, equality) => min + (max - min) * (equality / 100);
    var equality_rand = (min, max, equality) => _.random(min, equality_dance(min, max, equality), true);
    const generate = (count, equality) => _.map(_.range(count), _.partial(equality_rand, data.MinSalary, data.MaxSalary, equality));
    const average_earnings = (count, equality) => average(generate(count, equality));

    const pre_female_equaltiy = 100 * data.FemaleEqualityFactor;
    const equality_diff = Math.abs(100 - _.floor(100 * pre_female_equaltiy));
    const female_equality = data.FemaleEqualityFactor > 1 ? pre_female_equaltiy - equality_diff : pre_female_equaltiy;
    const male_equality = data.FemaleEqualityFactor > 1 ? 100 - equality_diff : 100;

    const male_average_earnings = sum_average(ITERATIONS, () => average_earnings(total_males, male_equality));
    console.log(`  Average male earnings = ${male_average_earnings.toFixed(2)}`);

    const female_average_earnings = sum_average(ITERATIONS, () => average_earnings(total_females, female_equality));
    console.log(`  Average female earnings = ${female_average_earnings.toFixed(2)}`);

    const average_wage_gap = sum_average(ITERATIONS,
        () => wage_gap(average_earnings(total_males, male_equality), average_earnings(total_females, female_equality)));
    console.log(`  Wage gap = ${percent(average_wage_gap)}%`);

    return {
        TotalMales: total_males,
        TotalFemales: total_females,
        MaleEarnings: male_average_earnings,
        FemaleEarnings: female_average_earnings,
        WageGap: average_wage_gap,
    };
}

const Data = _.map(Industries, map_indsutry_data);

const accumulate = (map, accumulator) => _.reduce(map, (memo, data) => memo + accumulator(data), 0);

const global_male_earnings = accumulate(Data, (data) => data.TotalMales * data.MaleEarnings);
const total_males = accumulate(Data, (data) => data.TotalMales);
const global_female_earnings = accumulate(Data, (data) => data.TotalFemales * data.FemaleEarnings);
const total_females = accumulate(Data, (data) => data.TotalFemales);

const global_male_average_earnings = global_male_earnings / total_males;
const global_female_average_earnings = global_female_earnings / total_females;

console.log(`Global male average earnings = ${global_male_average_earnings.toFixed(2)}`);
console.log(`Global female average earnings = ${global_female_average_earnings.toFixed(2)}`);
console.log(`Global wage gap = ${percent(wage_gap(global_male_average_earnings, global_female_average_earnings))}%`);

