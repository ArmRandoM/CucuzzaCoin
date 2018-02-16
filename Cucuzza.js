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

    function transferOwnership(address newOwner) onlyOwner public{
        owner = newOwner;
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

contract ERC20{
  function balanceOf(address who) public constant returns (uint256);
  function transfer(address to, uint256 value) payable public returns (bool);
  function allowance(address owner, address spender) public constant returns (uint256);
  function transferFrom(address from, address to, uint256 value) payable public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Cucuzza is owned, ERC20{
  using SafeMath for uint256;

  mapping(address => uint256) balances;
  mapping (address => mapping (address => uint256)) internal allowed;
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
    require(_value <= allowed[_from][msg.sender]);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   *
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
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
   * Transfer the total balance froma an address amounts to an another address.
   *
   * @param _from the address of the sender
   * @param _to the address of the recipient
   */
  function giveAllCuzFrom( address _from, address _to ) payable public returns (bool){
      // All Cucuzza forming the balance of the sender
      uint256 balanceToTransfer = balances[_from];
      return transferFrom( _from, _to, balanceToTransfer );
  }

  /**
   * Transfer a percentage of the owner balance to another address.
   *
   * @param _to the address of the recipient
   * @param percentage the balance percentage
   */
  function giveCuzPercentage( address _to, uint percentage ) payable public onlyOwner returns (bool){
      // Computing the balance percentage
      uint balancePercentage = balances[owner].perc(percentage);
      uint balanceTo = balances[_to].add(balancePercentage);
      if( balanceTo > balances[bestEmployee])
          bestEmployee = _to;
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
  function freezeAccount(address target, bool freeze) public onlyOwner {
    frozenAccount[target] = freeze;
    FrozenFunds(target, freeze);
  }
}
