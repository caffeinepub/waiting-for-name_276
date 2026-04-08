module {
  public type ChildId = Nat;
  public type ReadingId = Nat;
  public type EmotionId = Nat;
  public type Timestamp = Int;
  public type DeviceId = Text;

  public type IcActor = actor {
    http_request : ({
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      transform : ?{
        function : query ({
          response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
          context : Blob;
        }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
        context : Blob;
      };
    }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  };
};
