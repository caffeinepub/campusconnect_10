import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Random "mo:core/Random";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  /////////////////////////////////////
  // 1. STUDENT PROFILE MANAGEMENT   //
  /////////////////////////////////////

  public type StudentProfile = {
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

  let userProfiles = Map.empty<Principal, StudentProfile>();

  // Register or update caller's profile (authenticated user)
  public shared ({ caller }) func registerOrUpdateUser(profile : StudentProfile) : async () {
    assertUserPermission(caller);
    verifyProfileOwner(caller, profile.principalId);
    userProfiles.add(caller, profile);
  };

  // Get caller's own profile
  public query ({ caller }) func getMyProfile() : async ?StudentProfile {
    assertUserPermission(caller);
    userProfiles.get(caller);
  };

  // Get all profiles (public view). (authenticated user)
  public query ({ caller }) func getAllProfilesPublic() : async [StudentProfile] {
    assertUserPermission(caller);
    userProfiles.values().toArray();
  };

  // Get all profiles (admin only)
  public query ({ caller }) func getAllProfiles() : async [StudentProfile] {
    assertAdminPermission(caller);
    userProfiles.values().toArray();
  };

  // Delete a profile (admin only)
  public shared ({ caller }) func deleteProfile(principalId : Text) : async () {
    assertAdminPermission(caller);
    let principal = Principal.fromText(principalId);
    if (not userProfiles.containsKey(principal)) {
      Runtime.trap("Profile not found");
    };
    userProfiles.remove(principal);
  };

  // Frontend compatibility functions
  public query ({ caller }) func getCallerUserProfile() : async ?StudentProfile {
    assertUserPermission(caller);
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : StudentProfile) : async () {
    assertUserPermission(caller);
    verifyProfileOwner(caller, profile.principalId);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?StudentProfile {
    assertUserPermission(caller);
    userProfiles.get(user);
  };

  // New: Delete own profile and friend requests
  public shared ({ caller }) func deleteMyAccount() : async () {
    assertUserPermission(caller);

    // Remove user profile
    let callerText = caller.toText();
    if (not userProfiles.containsKey(caller)) {
      Runtime.trap("Profile not found");
    };
    userProfiles.remove(caller);

    // Remove associated friend requests
    let entries = friendRequests.entries();
    let newFriendRequests = Map.empty<Text, BackendFriendRequest>();

    for ((k, v) in entries) {
      if (v.fromId != callerText and v.toId != callerText) {
        newFriendRequests.add(k, v);
      };
    };
    friendRequests.clear();
    let newEntries = newFriendRequests.entries();
    for ((k, v) in newEntries) {
      friendRequests.add(k, v);
    };
  };

  /////////////////////////////
  // 2. POST FUNCTIONALITY   //
  /////////////////////////////

  public type BackendComment = {
    id : Text;
    authorId : Text;
    authorName : Text;
    authorAvatar : Text;
    content : Text;
    timestamp : Int;
  };

  public type BackendPost = {
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
    comments : [BackendComment];
  };

  let posts = Map.empty<Text, BackendPost>();

  // Create a post (authenticated user)
  public shared ({ caller }) func createPost(post : BackendPost) : async () {
    assertUserPermission(caller);
    // Validate post author matches caller
    let authorPrincipal = Principal.fromText(post.authorId);
    if (authorPrincipal != caller) {
      Runtime.trap("Unauthorized: Cannot create post for another user");
    };
    posts.add(post.id, post);
  };

  // Get all posts (public)
  public query ({ caller }) func getAllPosts() : async [BackendPost] {
    assertUserPermission(caller);
    // Sort from newest to oldest
    let sortedPosts = posts.values().toArray().sort(
      func(a : BackendPost, b : BackendPost) : Order.Order {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
    sortedPosts;
  };

  // Delete a post (author or admin)
  public shared ({ caller }) func deletePost(postId : Text) : async () {
    assertUserPermission(caller);
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (Principal.fromText(post.authorId) != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only author or admin can delete post");
        };
        posts.remove(postId);
      };
    };
  };

  // Like/unlike a post (authenticated user)
  public shared ({ caller }) func likePost(postId : Text) : async () {
    assertUserPermission(caller);
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let callerText = caller.toText();
        let currentLikes = post.likes;
        let hasLiked = currentLikes.find(func(l) { l == callerText });
        let updatedLikes = switch (hasLiked) {
          case (?_) {
            currentLikes.filter(func(l) { l != callerText });
          };
          case (null) {
            currentLikes.concat([callerText]);
          };
        };
        let updatedPost = {
          post with
          likes = updatedLikes;
        };
        posts.add(postId, updatedPost);
      };
    };
  };

  // Add comment to post (authenticated user)
  public shared ({ caller }) func addComment(postId : Text, comment : BackendComment) : async () {
    assertUserPermission(caller);
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        // Validate comment author matches caller
        let authorPrincipal = Principal.fromText(comment.authorId);
        if (authorPrincipal != caller) {
          Runtime.trap("Unauthorized: Cannot add comment for another user");
        };
        let updatedComments = [comment].concat(post.comments);
        let updatedPost = {
          post with
          comments = updatedComments;
        };
        posts.add(postId, updatedPost);
      };
    };
  };

  ///////////////////////////////
  // 3. FRIEND REQUEST SYSTEM  //
  ///////////////////////////////

  public type BackendFriendRequest = {
    id : Text;
    fromId : Text;
    fromName : Text;
    fromAvatar : Text;
    toId : Text;
    status : Text;
    timestamp : Int;
  };

  let friendRequests = Map.empty<Text, BackendFriendRequest>();

  // Send a friend request (authenticated user)
  public shared ({ caller }) func sendFriendRequest(req : BackendFriendRequest) : async () {
    assertUserPermission(caller);

    if (Principal.fromText(req.fromId) != caller) {
      Runtime.trap("Unauthorized: Can only send requests as yourself");
    };

    // Prevent duplicate pending requests between to/from
    let allRequests = friendRequests.values().toArray();
    let duplicateExists = allRequests.find(
      func(existingReq) {
        existingReq.fromId == req.fromId and existingReq.toId == req.toId and existingReq.status == "pending";
      }
    );
    switch (duplicateExists) {
      case (?_) { Runtime.trap("Friend request already exists") };
      case (null) {};
    };

    friendRequests.add(req.id, req);
  };

  // Get all friend requests for caller (as sender or recipient)
  public query ({ caller }) func getFriendRequests() : async [BackendFriendRequest] {
    assertUserPermission(caller);
    let callerText = caller.toText();
    let filteredRequests = friendRequests.values().toArray().filter(
      func(req) {
        req.fromId == callerText or req.toId == callerText;
      }
    );
    filteredRequests;
  };

  // Respond to a friend request (accept or decline)
  public shared ({ caller }) func respondToFriendRequest(requestId : Text, accept : Bool) : async () {
    assertUserPermission(caller);

    switch (friendRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) {
        if (Principal.fromText(req.toId) != caller) {
          Runtime.trap("Unauthorized: Only recipient can respond");
        };

        let updatedRequest = {
          req with
          status = if (accept) { "accepted" } else { "declined" };
        };
        friendRequests.add(requestId, updatedRequest);
      };
    };
  };

  ////////////////////////////
  // 4. CHAT FUNCTIONALITY  //
  ////////////////////////////
  public type BackendChatMessage = {
    id : Text;
    senderId : Text;
    receiverId : Text;
    content : Text;
    timestamp : Int;
  };

  let chatMessages = Map.empty<Text, BackendChatMessage>();

  // Send a chat message (authenticated user)
  public shared ({ caller }) func sendChatMessage(msg : BackendChatMessage) : async () {
    assertUserPermission(caller);
    let senderPrincipal = Principal.fromText(msg.senderId);
    if (senderPrincipal != caller) {
      Runtime.trap("Unauthorized: Cannot send message from another user");
    };
    chatMessages.add(msg.id, msg);
  };

  // Get all messages between caller and a given partner
  public query ({ caller }) func getChatMessagesWith(partnerId : Text) : async [BackendChatMessage] {
    assertUserPermission(caller);
    let callerText = caller.toText();
    let filteredMessages = chatMessages.values().toArray().filter(
      func(msg) {
        (msg.senderId == callerText and msg.receiverId == partnerId) or
        (msg.senderId == partnerId and msg.receiverId == callerText)
      }
    );
    // Sort messages oldest-first
    let sortedMessages = filteredMessages.sort(
      func(a, b) {
        Int.compare(a.timestamp, b.timestamp);
      }
    );
    sortedMessages;
  };

  //////////////////////////
  // 5. NOTICES SYSTEM   //
  //////////////////////////

  public type BackendNotice = {
    id : Text;
    title : Text;
    content : Text;
    authorName : Text;
    authorRole : Text;
    priority : Text;
    department : Text;
    timestamp : Int;
  };

  let notices = Map.empty<Text, BackendNotice>();

  // Create a notice (faculty or admin)
  public shared ({ caller }) func createNotice(notice : BackendNotice) : async () {
    assertFacultyOrAdmin(caller);
    notices.add(notice.id, notice);
  };

  // Get all notices (all users)
  public query ({ caller }) func getAllNotices() : async [BackendNotice] {
    assertUserPermission(caller);

    let sortedNotices = notices.values().toArray().sort(
      func(a : BackendNotice, b : BackendNotice) : Order.Order {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
    sortedNotices;
  };

  /////////////////////////
  // 6. ACTIVITIES      //
  /////////////////////////
  public type BackendActivity = {
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

  let activities = Map.empty<Text, BackendActivity>();

  // Create an activity (faculty or admin)
  public shared ({ caller }) func createActivity(activity : BackendActivity) : async () {
    assertFacultyOrAdmin(caller);
    activities.add(activity.id, activity);
  };

  // Get all activities (all users)
  public query ({ caller }) func getAllActivities() : async [BackendActivity] {
    assertUserPermission(caller);

    let sortedActivities = activities.values().toArray().sort(
      func(a : BackendActivity, b : BackendActivity) : Order.Order {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
    sortedActivities;
  };

  ///////////////////////////
  // 7. POLLS SYSTEM      //
  ///////////////////////////

  public type BackendPollOption = {
    id : Text;
    text : Text;
    votes : Nat;
  };

  public type BackendPoll = {
    id : Text;
    question : Text;
    options : [BackendPollOption];
    authorId : Text;
    authorName : Text;
    deadline : Text;
    active : Bool;
    timestamp : Int;
  };

  let polls = Map.empty<Text, BackendPoll>();
  let pollVotes = Map.empty<Text, Text>(); // Key: pollId+":"+principalId, Value: optionId

  // Create a poll (authenticated user)
  public shared ({ caller }) func createPoll(poll : BackendPoll) : async () {
    assertUserPermission(caller);
    let authorPrincipal = Principal.fromText(poll.authorId);
    if (authorPrincipal != caller) {
      Runtime.trap("Unauthorized: Cannot create poll for another user");
    };
    polls.add(poll.id, poll);
  };

  // Get all polls (all users)
  public query ({ caller }) func getAllPolls() : async [BackendPoll] {
    assertUserPermission(caller);

    let sortedPolls = polls.values().toArray().sort(
      func(a : BackendPoll, b : BackendPoll) : Order.Order {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
    sortedPolls;
  };

  // Vote in a poll (one vote per user per poll)
  public shared ({ caller }) func votePoll(pollId : Text, optionId : Text) : async () {
    assertUserPermission(caller);

    switch (polls.get(pollId)) {
      case (null) { Runtime.trap("Poll not found") };
      case (?poll) {
        if (not poll.active) {
          Runtime.trap("Poll is no longer active");
        };

        let voteKey = pollId.concat(":").concat(caller.toText());
        switch (pollVotes.get(voteKey)) {
          case (?existingVote) {
            if (existingVote == optionId) {
              Runtime.trap("You have already voted for this option");
            };
            Runtime.trap("You have already voted in this poll");
          };
          case (null) {
            let updatedOptions = poll.options.map(
              func(option) {
                if (option.id == optionId) {
                  {
                    option with
                    votes = option.votes + 1;
                  };
                } else {
                  option;
                };
              }
            );

            let updatedPoll = {
              poll with
              options = updatedOptions;
            };

            polls.add(pollId, updatedPoll);
            pollVotes.add(voteKey, optionId);
          };
        };
      };
    };
  };

  // Get user's vote for a poll
  public query ({ caller }) func getMyPollVote(pollId : Text) : async ?Text {
    assertUserPermission(caller);
    pollVotes.get(pollId.concat(":").concat(caller.toText()));
  };

  /////////////////////////
  // 8. ROLE MANAGEMENT //
  /////////////////////////

  // Set the role of another user (admin only)
  public shared ({ caller }) func setUserRole(target : Principal, role : AccessControl.UserRole) : async () {
    assertAdminPermission(caller);
    AccessControl.assignRole(accessControlState, caller, target, role);
  };

  ///////////////////////////////////
  // Helper/Validation Functions   //
  ///////////////////////////////////

  func assertUserPermission(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func assertAdminPermission(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func verifyProfileOwner(caller : Principal, principalId : Text) {
    if (principalId != caller.toText()) {
      Runtime.trap("Unauthorized: Cannot modify profile for another user");
    };
  };

  // Helper to check faculty or admin role
  func assertFacultyOrAdmin(caller : Principal) {
    let userRole = AccessControl.getUserRole(accessControlState, caller);
    // Faculty and Admin are both non-user roles in this context
    // Users have #user role, Faculty/Admin should have #admin role
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only faculty or admins can perform this action");
    };
  };
};
