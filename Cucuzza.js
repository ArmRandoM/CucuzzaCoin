pragma solidity ^0.4.16;

/* Cucuzza is a cryptocurrency made by MINOARO SAPPO*/

contract owned{
    address public owner;

    function owned() public{
        owner = msg.sender;
    }

    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }
}

library SafeMath{
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }

  function perc(uint256 a, uint256 b) internal pure returns (uint256){
    uint256 c = (a * b) / 100;
    assert( c >= 0);
    return c;
  }
}

contract ARM20{
  function balanceOf(address who) public constant returns (uint256);
  function transfer(address to, uint256 value) payable public returns (bool);
  function transferFrom(address from, address to, uint256 value) payable public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Cucuzza is owned, ARM20{
  using SafeMath for uint256;

  mapping(address => uint256) balances;
  mapping(address => uint256) employeeAwards;
  mapping (address => bool) public frozenAccount;
  event FrozenFunds(address target, bool frozen);

  // Public variables of the token
  string public constant name= "Cucuzza";
  string public constant symbol= "Cuz";
  uint8 public constant decimals = 8;
  uint256 public initialSupply = 100000000000000;
  uint256 public totalSupply = initialSupply;
  address public bestEmployee;

  function Cucuzza() public{
      balances[owner] = initialSupply;//give to the creator the initialSupply
  }
 /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) payable public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public constant returns (uint256 balance) {
    return balances[_owner];
  }

   /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) payable public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * Transfer the collected Cuz value to the owner and increase the totalSupply
   */
  function collectedCuz(uint256 collectedNumber) payable public{
       balances[owner] = balances[owner].add(collectedNumber);
       totalSupply = totalSupply.add(collectedNumber);
       transfer(owner,collectedNumber);
  }

  /**
   * Transfer the total balance amounts to an another address.
   *
   * @param _to the address of the recipient
   */
  function giveAllCuz( address _to) payable public returns (bool){
      // All Cucuzza forming the balance of the sender
      uint256 balanceToTransfer = balances[msg.sender];
      return transfer( _to, balanceToTransfer );
  }

  /**
   * Transfer a percentage of the owner balance to another address.
   *
   * @param _to the address of the recipient
   * @param percentage the balance percentage
   */
  function giveCuzPercentage( address _to, uint percentage ) payable onlyOwner public returns (bool){
      // Computing the balance percentage
      require( _to != address(0));
      uint balancePercentage = balances[owner].perc(percentage);
      uint awardTo = employeeAwards[_to].add(balancePercentage);
      if( bestEmployee == address(0) || awardTo > employeeAwards[bestEmployee] )
        bestEmployee = _to;
      employeeAwards[_to] = awardTo;
      return transfer( _to, balancePercentage);
  }

  /**
   * Transfer a MINOARO from the sender address balance to another address
   *
   * @param _to the address of the recipient
   */
   function giveAMinoaro(address _to) payable public returns (bool){
     return transfer( _to, 1 );
  }

  /** Freeze Prevent | Allow target from sending & receiving tokens
   *
   * @param target Address to be frozen
   * @param freeze either to freeze it or not
   */
  function freezeAccount(address target, bool freeze) onlyOwner public{
    require( target != address(0));
    frozenAccount[target] = freeze;
    FrozenFunds(target, freeze);
  }

  /**
   * Transfer to another address the contract ownership and the current owner amount
   */
   function transferOwnership( address newOwner ) onlyOwner public returns (bool){
        require( newOwner != address(0));
        giveAllCuz( newOwner );
        owner = newOwner;
        return true;
   }
}
