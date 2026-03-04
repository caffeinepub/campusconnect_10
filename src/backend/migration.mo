import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, OldStudentProfile>;
    posts : Map.Map<Text, OldBackendPost>;
    friendRequests : Map.Map<Text, OldBackendFriendRequest>;
    chatMessages : Map.Map<Text, OldBackendChatMessage>;
  };

  type OldStudentProfile = {
    principalId : Text;
    name : Text;
    email : Text;
    mobile : Text;
    course : Text;
    yearOfDegree : Text;
    division : Text;
    rollNumber : Text;
    department : Text;
    bio : Text;
    avatarUrl : Text;
    role : Text;
  };

  type OldBackendComment = {
    id : Text;
    authorId : Text;
    authorName : Text;
    authorAvatar : Text;
    content : Text;
    timestamp : Int;
  };

  type OldBackendPost = {
    id : Text;
    authorId : Text;
    authorName : Text;
    authorRole : Text;
    authorAvatar : Text;
    authorCourse : Text;
    authorDivision : Text;
    content : Text;
    imageUrl : Text;
    videoUrl : Text;
    timestamp : Int;
    likes : [Text];
    comments : [OldBackendComment];
  };

  type OldBackendFriendRequest = {
    id : Text;
    fromId : Text;
    fromName : Text;
    fromAvatar : Text;
    toId : Text;
    status : Text;
    timestamp : Int;
  };

  type OldBackendChatMessage = {
    id : Text;
    senderId : Text;
    receiverId : Text;
    content : Text;
    timestamp : Int;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, OldStudentProfile>;
    posts : Map.Map<Text, OldBackendPost>;
    friendRequests : Map.Map<Text, OldBackendFriendRequest>;
    chatMessages : Map.Map<Text, OldBackendChatMessage>;
    notices : Map.Map<Text, notices>;
    activities : Map.Map<Text, activities>;
    polls : Map.Map<Text, polls>;
    pollVotes : Map.Map<Text, Text>;
  };

  type notices = {
    id : Text;
    title : Text;
    content : Text;
    authorName : Text;
    authorRole : Text;
    priority : Text;
    department : Text;
    timestamp : Int;
  };

  type activities = {
    id : Text;
    name : Text;
    description : Text;
    date : Text;
    time : Text;
    organizer : Text;
    category : Text;
    location : Text;
    registrations : Nat;
    timestamp : Int;
  };

  type polls = {
    id : Text;
    question : Text;
    options : [pollsoption];
    authorId : Text;
    authorName : Text;
    deadline : Text;
    active : Bool;
    timestamp : Int;
  };

  type pollsoption = {
    id : Text;
    text : Text;
    votes : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let notices = Map.empty<Text, notices>();
    let activities = Map.empty<Text, activities>();
    let polls = Map.empty<Text, polls>();
    let pollVotes = Map.empty<Text, Text>();

    {
      old with
      notices;
      activities;
      polls;
      pollVotes;
    };
  };
};
