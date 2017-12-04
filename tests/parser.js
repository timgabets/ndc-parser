import test from 'ava';
import Parser from '../lib/parser.js';

const p = new Parser();

test('should return true', t => {
  t.is(true, true);
});
/*
  describe('getIncomingMessageLength()', t => {
  */
test('should be able to get length of the empty message', t =>  {
  t.is(p.getIncomingMessageLength(''), 0);
});

test('should be able to parse the message length 1', t =>  {
  t.is(p.getIncomingMessageLength('\x00\x01x'), 1);
});

test('should be able to parse the message length 10', t =>  {
  t.is(p.getIncomingMessageLength('\x00\x0ax'), 10);
});

test('should be able to parse the message length 255', t =>  {
  t.is(p.getIncomingMessageLength('\x00\xffx'), 255);
});

test('should be able to parse the message length 256', t =>  {
  t.is(p.getIncomingMessageLength('\x01\x00x'), 256);
});

test('should be able to parse the message length 43981', t =>  {
  t.is(p.getIncomingMessageLength('\xab\xcdx'), 43981);
});

test('should be able to parse the message length 65535', t =>  {
  t.is(p.getIncomingMessageLength('\xff\xffx'), 65535);
});


/**
 * describe('parse())', t => {
 */
test('should be able to parse "Go out of service" message', t =>  {
  let parsed = { 
    message_class: 'Terminal Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    command_code: 'Go out-of-service' 
  };
  t.deepEqual(p.parse('10\x1c000\x1c000\x1c2', 12), parsed);
});

test('should be able to parse "Transaction reply" message', t =>  {
  let parsed = { 
    message_class: 'Transaction Reply Command', 
    LUNO: '000', 
    message_sequence_number: '', 
    next_state: '133', 
    notes_to_dispense: '',
    transaction_serial_number: '0775', 
    function_identifier: { 
      '9': 'Display and print' 
    }, 
    screen_number: '064', 
    message_coordination_number: '2', 
    card_return_flag: {
      '0': 'Return card during the Close state',
    }
  };
  t.deepEqual(p.parse('40\x1c000\x1c\x1c133\x1c\x1c07759064\x1c200', 25), parsed);
});

test('should be able to parse Receipt Printer Data field in "Transaction reply" message', t =>  {
  let parsed = { 
    message_class: 'Transaction Reply Command', 
    LUNO: '000', 
    message_sequence_number: '', 
    next_state: '142', 
    notes_to_dispense: '',
    transaction_serial_number: '2835',
    function_identifier: { 5: 'Set next state and print' },
    screen_number: '025',
    message_coordination_number: 'G',
    card_return_flag: { 0: 'Return card during the Close state' },
    receipt_printer_data: 'RECEIPT PRINTER DATA',
  };
  t.deepEqual(p.parse('40\x1c000\x1c\x1c142\x1c\x1c28355025\x1cG02RECEIPT PRINTER DATA'), parsed);
});

test('should be able to parse Journal Printer Data field in "Transaction reply" message', t =>  {
  let parsed = { 
    message_class: 'Transaction Reply Command', 
    LUNO: '000', 
    message_sequence_number: '', 
    next_state: '142', 
    notes_to_dispense: '',
    transaction_serial_number: '2835',
    function_identifier: { 5: 'Set next state and print' },
    screen_number: '025',
    message_coordination_number: 'G',
    card_return_flag: { 0: 'Return card during the Close state' },
    journal_printer_data: 'JOURNAL PRINTER DATA',
  };
  t.deepEqual(p.parse('40\x1c000\x1c\x1c142\x1c\x1c28355025\x1cG01JOURNAL PRINTER DATA'), parsed);
});

test('should be able to parse Receipt and Journal Printer Data fields in "Transaction reply" message', t =>  {
  let parsed = { 
    message_class: 'Transaction Reply Command', 
    LUNO: '000', 
    message_sequence_number: '', 
    next_state: '142', 
    notes_to_dispense: '',
    transaction_serial_number: '2835',
    function_identifier: { 5: 'Set next state and print' },
    screen_number: '025',
    message_coordination_number: 'G',
    card_return_flag: { 0: 'Return card during the Close state' },
    receipt_printer_data: 'RECEIPT PRINTER DATA',
    journal_printer_data: 'JOURNAL PRINTER DATA',
  };
  t.deepEqual(p.parse('40\x1c000\x1c\x1c142\x1c\x1c28355025\x1cG02RECEIPT PRINTER DATA\x1d1JOURNAL PRINTER DATA'), parsed);
});

test('should be able to parse "print on receipt and journal printer" flag in "Transaction reply" message', t =>  {
  let parsed = { 
    message_class: 'Transaction Reply Command', 
    LUNO: '000', 
    message_sequence_number: '', 
    next_state: '142', 
    notes_to_dispense: '',
    transaction_serial_number: '2835',
    function_identifier: { 5: 'Set next state and print' },
    screen_number: '025',
    message_coordination_number: 'G',
    card_return_flag: { 0: 'Return card during the Close state' },
    receipt_printer_data: 'RECEIPT PRINTER AND JOURNAL PRINTER DATA',
    journal_printer_data: 'RECEIPT PRINTER AND JOURNAL PRINTER DATA',
  };
  t.deepEqual(p.parse('40\x1c000\x1c\x1c142\x1c\x1c28355025\x1cG03RECEIPT PRINTER AND JOURNAL PRINTER DATA'), parsed);
});

test('should be able to parse "print on receipt and journal printer" flag in "Transaction reply" message', t =>  {
  let parsed = { 
    message_class: 'Transaction Reply Command', 
    LUNO: '000', 
    message_sequence_number: '', 
    next_state: '142', 
    notes_to_dispense: '',
    transaction_serial_number: '2880',
    function_identifier: { 5: 'Set next state and print' },
    screen_number: '025',
    screen_display_update: 'u09621000\x1d0000078SCREEN DATA'
  };
  t.deepEqual(p.parse('40\x1c000\x1c\x1c142\x1c\x1c28805025u09621000\x1d0000078SCREEN DATA'), parsed);
});

/**
 * describe('parseDataCommands - Load States', t => {
 */
test('should be able to parse "Interactive Transaction Response" message', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Interactive Transaction Response', 
    display_flag: '1', 
    active_keys: '0110011000', 
    screen_timer_field: '074', 
    screen_data_field: 'SCREENDATA' 
  };
  t.deepEqual(p.parse('30\x1c000\x1c000\x1c210110011000\x1c074\x1cSCREENDATA'), parsed);
});


/*
  02 6e 33 30 1c 30 30 30 1c 30 30 30 1c 31 32 1c         .n30.000.000.12.
  30 30 30 41 38 37 30 35 30 30 31 32 38 30 30 32         000A870500128002
  30 30 32 30 30 32 30 30 31 31 32 37 1c 30 30 31         002002001127.001
  4b 30 30 33 30 30 34 30 30 34 31 32 37 31 32 37         K003004004127127
  31 32 37 31 32 37 31 32 37 1c 30 30 32 4a 31 33         127127127.002J13
  32 30 30 30 31 33 32 31 33 36 31 33 32 30 30 30         2000132136132000
  30 38 31 31 37 38 1c 30 30 33 44 30 32 34 30 30         081178.003D02400
  30 31 32 38 30 30 30 30 30 30 30 30 30 30 30 30         0128000000000000
  30 30 30 1c 30 30 34 44 30 32 34 30 30 30 30 30         000.004D02400000
  30 31 32 38 30 30 30 30 30 30 30 30 30 30 30 30         0128000000000000
  1c 30 32 34 42 30 32 34 30 30 32 31 33 31 30 32         .024B02400213102
  36 30 32 36 31 33 38 30 32 36 30 30 33 1c 30 32         6026138026003.02
  36 4b 30 33 31 30 34 33 30 34 30 30 33 31 30 33         6K03104304003103
  31 30 33 31 30 33 31 30 33 31 1c 30 32 37 49 30         1031031031.027I0
  32 35 31 34 36 30 30 31 30 30 30 30 30 31 30 30         2514600100000100
  31 30 30 31 30 30 33 1c 30 33 31 58 30 33 31 30         1001003.031X0310
  30 32 31 33 31 30 33 32 30 33 33 30 31 30 32 35         0213103203301025
  35 30 30 30 1c 30 33 32 57 30 33 34 33 35 32 36         5000.032W0343526
  35 31 31 32 37 32 33 30 30 33 31 35 37 30 31 39         5112723003157019
  31 1c 30 33 33 5a 30 30 30 30 30 30 30 30 30 30         1.033Z0000000000
  30 30 30 30 30 30 30 30 30 30 30 30 30 30 1c 30         00000000000000.0
  33 34 58 30 33 34 30 30 32 31 33 31 30 33 35 30         34X0340021310350
  33 36 30 31 30 32 35 35 30 30 30 1c 30 33 35 57         36010255000.035W
  31 38 31 30 33 37 32 35 35 31 32 37 30 33 31 30         1810372551270310
  33 34 32 35 30 31 38 36 1c 30 33 36 5a 30 30 30         34250186.036Z000
  30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30         0000000000000000
  30 30 30 30 30 1c 30 33 37 58 30 33 37 30 30 32         00000.037X037002
  31 33 31 30 33 38 30 33 39 30 31 30 32 35 35 30         1310380390102550
  30 30 1c 30 33 38 57 32 30 31 31 39 36 33 33 30         00.038W201196330
  32 35 35 30 33 31 33 39 30 33 37 30 30 33 31 1c         255031390370031.
  30 33 39 5a 30 30 30 30 30 30 30 30 30 30 30 30         039Z000000000000
  30 30 30 30 30 30 30 30 30 30 30 30 1c 30 34 30         000000000000.040
  58 30 34 30 30 30 32 31 33 31 30 34 31 30 34 32         X040002131041042
  30 31 30 32 35 35 30 30 30 1c 30 34 31 57 30 34         010255000.041W04
  38 32 37 30 35 37 30 31 32 37 33 35 32 30 34 30         8270570127352040
  30 34 30 30 34 30 1c 30 34 32 5a 30 30 30 30 30         040040.042Z00000
  30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30         0000000000000000
  30 30 30 1c 30 34 33 58 30 34 33 30 30 32 31 33         000.043X04300213
  31 30 34 34 30 34 35 30 31 30 32 35 35 30 30 30         1044045010255000
*/

/**
 * describe('parseDataCommands - Load States', t => {
 */
test('should be able to parse "Load States" message (single state)', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Customization Command',
    message_identifier: 'State Tables load', 
    states: [ '000A870500128002002002001127' ] 
  };
  t.deepEqual(p.parse('30\x1C000\x1C000\x1C12\x1C000A870500128002002002001127'), parsed);
});

test('should be able to parse "Load States" message (multiple states)', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Customization Command',
    message_identifier: 'State Tables load',  
    states: [ 
      '000A870500128002002002001127', 
      '001K003004004127127127127127', 
      '002J132000132136132000081178', 
      '003D024000128000000000000000', 
      '004D024000000128000000000000', 
      '024B024002131026026138026003', 
      '026K031043040031031031031031', 
      '027I025146001000001001001003', 
      '031X031002131032033010255000', 
      '032W034352651127230031570191', 
      '033Z000000000000000000000000', 
      '034X034002131035036010255000', 
      '035W181037255127031034250186', 
      '036Z000000000000000000000000', 
      '037X037002131038039010255000', 
      '038W201196330255031390370031', 
      '039Z000000000000000000000000', 
      '040X040002131041042010255000', 
      '041W048270570127352040040040', 
      '042Z000000000000000000000000', 
      '043X043002131044045010255000' 
    ]
  };
  t.deepEqual(p.parse('3000000012000A870500128002002002001127001K003004004127127127127127002J132000132136132000081178003D024000128000000000000000004D024000000128000000000000024B024002131026026138026003026K031043040031031031031031027I025146001000001001001003031X031002131032033010255000032W034352651127230031570191033Z000000000000000000000000034X034002131035036010255000035W181037255127031034250186036Z000000000000000000000000037X037002131038039010255000038W201196330255031390370031039Z000000000000000000000000040X040002131041042010255000041W048270570127352040040040042Z000000000000000000000000043X043002131044045010255000'), parsed);
});

/**
 * describe('parseDataCommands - Load Screens', t => {
 */

test('should be able to parse "Load Screens" message (single screen)', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Customization Command',
    message_identifier: 'Screen Data load', 
    screens: [ '001SCREENDATA' ] 
  };
  t.deepEqual(p.parse('3000000011001SCREENDATA'), parsed);
});

test('should be able to parse "Load Screens" message (multiple screens)', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Customization Command',
    message_identifier: 'Screen Data load',  
    screens: [ 
      '000\x0c\x1bPEPIC000.jpg\x1b\x5c', 
      '002SCREENDATA2', 
      '003SCREENDATA3', 
    ]
  };
  t.deepEqual(p.parse('3000000011000\x0c\x1bPEPIC000.jpg\x1b\x5c002SCREENDATA2003SCREENDATA3'), parsed);
});

/**
 * describe('parseDataCommands - Load FITSs', t => {
 */
test('should be able to parse "Load FITs" message (single entry)', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Customization Command',
    message_identifier: 'FIT Data load', 
    FITs: [ '000000064000001255255001000132000015000144000000000000000000000000000000000000000000000000000000000' ] 
  };
  t.deepEqual(p.parse('3000000015000000064000001255255001000132000015000144000000000000000000000000000000000000000000000000000000000'), parsed);
});
    
test('should be able to parse "Load FITs" message (multiple entries)', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Customization Command',
    message_identifier: 'FIT Data load', 
    FITs: [ 
      '000000064000001255255001000132000015000144000000000000000000000000000000000000000000000000000000000',
      '001000065007054255255001000132000015000144000000000000000000000000000000000000000000000000000000000',
      '002000065007055255255001000132000015000144000000000000000000000000000000000000000000000000000000000',
      '003000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000',
      '004000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000',
      '005000065136086255255001000132000015000144000000000000000000000000000000000000000000000000000000000'
    ]
  };
  t.deepEqual(p.parse('3000000015000000064000001255255001000132000015000144000000000000000000000000000000000000000000000000000000000001000065007054255255001000132000015000144000000000000000000000000000000000000000000000000000000000002000065007055255255001000132000015000144000000000000000000000000000000000000000000000000000000000003000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000004000065136037255255001000132000015000144000000000000000000000000000000000000000000000000000000000005000065136086255255001000132000015000144000000000000000000000000000000000000000000000000000000000'), parsed);
});

/**
 * describe('parseDataCommands - Extended Encryption Key Information', t => {
 */
test('should be able to parse "Extended Encryption Key Information" message', t =>  {
  let parsed = { 
    message_class: 'Data Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    message_subclass: 'Extended Encryption Key Information', 
    modifier: 'Decipher new comms key with current master key', 
    new_key_length: '030',
    new_key_data: '000000000000000000000000000000000000000000000000',
  };
  /**
   * 00 41 33 30 1c 30 30 30 1c 30 30 30 1c 34 32 1c         .A30.000.000.42.
   * 30 33 30 30 30 30 30 30 30 30 30 30 30 30 30 30         0300000000000000
   * 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30         0000000000000000
   * 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30         0000000000000000
   * 30 30 30                                                000
   */
  t.deepEqual(p.parse('30\x1c000\x1c000\x1c42\x1c030000000000000000000000000000000000000000000000000'), parsed);
});

/**
 * describe('parseHostMessage()', t => {
 */
test('should be able to parse "Go out of service" message', t =>  {
  let parsed = { 
    message_class: 'Terminal Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    command_code: 'Go out-of-service' 
  };
  /*
   *  00 0c 31 30 1c 30 30 30 1c 30 30 30 1c 32               ..10.000.000.2
   */
  t.deepEqual(p.parseHostMessage('\x00\x0c10\x1c000\x1c000\x1c2'), parsed);
});

test('should be able to parse "Send Configuration ID" message', t =>  {
  let parsed = { 
    message_class: 'Terminal Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    command_code: 'Send Configuration ID' 
  };
  /*
   *  00 0c 31 30 1c 30 30 30 1c 30 30 30 1c 33               ..10.000.000.3
   */
  t.deepEqual(p.parseHostMessage('\x00\x0c10\x1c000\x1c000\x1c3'), parsed);
});

test('should be able to parse "Send supply counters" message', t =>  {
  let parsed = { 
    message_class: 'Terminal Command', 
    LUNO: '000', 
    message_sequence_number: '000', 
    command_code: 'Send Supply Counters' 
  };
  /*
   *  00 0c 31 30 1c 30 30 30 1c 30 30 30 1c 34               ..10.000.000.4
   */
  t.deepEqual(p.parseHostMessage('\x00\x0c10\x1c000\x1c000\x1c4'), parsed);
});

/**
 * describe('getFunctionIdentifierDescription()', t => {
 */
test('should parse function identifier 1', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('1'), {'1': 'Deposit and print'});
});

test('should parse function identifier 2', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('2'), {'2': 'Dispense and print'});
});

test('should parse function identifier 3', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('3'), {'3': 'Display and print'});
});

test('should parse function identifier 4', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('4'), {'4': 'Print immediate'});
});

test('should parse function identifier 5', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('5'), {'5': 'Set next state and print'});
});

test('should parse function identifier 7', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('7'), {'7': 'Deposit and print'});
});

test('should parse function identifier 8', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('8'), {'8': 'Dispense and print'});
});

test('should parse function identifier 9', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('9'), {'9': 'Display and print'});
});

test('should parse function identifier A', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('A'), {'A': 'Eject card and dispense and print (card before cash)'});
});

test('should parse function identifier B', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('B'), {'B': 'Parallel dispense and print and card eject'});
});    

test('should parse function identifier C', t => {
  t.deepEqual(p.getFunctionIdentifierDescription('C'), {'C': 'Parallel dispense and print and card eject'});
});    

/**
 * describe('getCardReturnFlagDescription()', t => {
 */
test('should parse card return flag 0', t => {
  t.deepEqual(p.getCardReturnFlagDescription('0'), {'0': 'Return card during the Close state'});
});

test('should parse card return flag 1', t => {
  t.deepEqual(p.getCardReturnFlagDescription('1'), {'1': 'Retain card during the Close state'});
});

test('should parse card return flag 4', t => {
  t.deepEqual(p.getCardReturnFlagDescription('4'), {'4': 'Return card while processing the transaction reply'});
});

/**
 *  describe('getPrinterFlagDescription()', t => {
 */
test('should parse printer flag 0', t => {
  t.deepEqual(p.getPrinterFlagDescription('0'), {'0': 'Do not print'});
});

test('should parse printer flag 1', t => {
  t.deepEqual(p.getPrinterFlagDescription('1'), {'1': 'Print on journal printer only'});
});

test('should parse printer flag 2', t => {
  t.deepEqual(p.getPrinterFlagDescription('2'), {'2': 'Print on receipt printer only'});
});

test('should parse printer flag 3', t => {
  t.deepEqual(p.getPrinterFlagDescription('3'), {'3': 'Print on receipt and journal printer'});
});

/**
 * parseEMVConfiguration()
 */
test('should parse EMV Configuration - ICC Currency Data Objects table message', t => {
  let parsed = { 
    message_class: 'EMV Configuration', 
    LUNO: '000', 
    message_sequence_number: '',
    message_subclass: 'ICC Currency Data Objects table'
  };
  t.deepEqual(p.parse('80\x1c000\x1c\x1c1\x1c'), parsed);
});

test('should parse EMV Configuration - ICC Transaction Data Objects table', t => {
  let parsed = { 
    message_class: 'EMV Configuration', 
    LUNO: '000', 
    message_sequence_number: '',
    message_subclass: 'ICC Transaction Data Objects table'
  };
  t.deepEqual(p.parse('80\x1c000\x1c\x1c2'), parsed);
});

test('should parse EMV Configuration - ICC Language Support table', t => {
  let parsed = { 
    message_class: 'EMV Configuration', 
    LUNO: '000', 
    message_sequence_number: '',
    message_subclass: 'ICC Language Support table'
  };
  t.deepEqual(p.parse('80\x1c000\x1c\x1c3'), parsed);
});

test('should parse EMV Configuration - ICC Terminal Data Objects table', t => {
  let parsed = { 
    message_class: 'EMV Configuration', 
    LUNO: '000', 
    message_sequence_number: '',
    message_subclass: 'ICC Terminal Data Objects table'
  };
  t.deepEqual(p.parse('80\x1c000\x1c\x1c4'), parsed);
});

test('should parse EMV Configuration - ICC Terminal Acceptable AIDs table', t => {
  let parsed = { 
    message_class: 'EMV Configuration', 
    LUNO: '000', 
    message_sequence_number: '',
    message_subclass: 'ICC Terminal Acceptable AIDs table'
  };
  t.deepEqual(p.parse('80\x1c000\x1c\x1c5'), parsed);
});







