import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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

  // Register a new user profile (any authenticated user)
  public shared ({ caller }) func registerUser(profile : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register profiles");
    };
    
    // Ensure the principalId matches the caller
    let callerText = caller.toText();
    if (profile.principalId != callerText) {
      Runtime.trap("Unauthorized: Cannot register profile for another user");
    };
    
    userProfiles.add(caller, profile);
  };

  // Update caller's own profile (any authenticated user)
  public shared ({ caller }) func updateProfile(profile : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    
    // Ensure the principalId matches the caller
    let callerText = caller.toText();
    if (profile.principalId != callerText) {
      Runtime.trap("Unauthorized: Cannot update profile for another user");
    };
    
    userProfiles.add(caller, profile);
  };

  // Get caller's own profile
  public query ({ caller }) func getMyProfile() : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  // Get all profiles (public view)
  public query ({ caller }) func getAllProfilesPublic() : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view public profiles");
    };
    userProfiles.values().toArray();
  };

  // Get all profiles (admin only)
  public query ({ caller }) func getAllProfiles() : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all profiles");
    };
    userProfiles.values().toArray();
  };

  // Delete a profile (admin only)
  public shared ({ caller }) func deleteProfile(principalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete profiles");
    };

    let principal = Principal.fromText(principalId);
    let existed = userProfiles.containsKey(principal);
    userProfiles.remove(principal);
    if (not existed) {
      Runtime.trap("Profile not found");
    };
  };

  // Frontend compatibility functions
  
  // Get caller's user profile (frontend compatibility)
  public query ({ caller }) func getCallerUserProfile() : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  // Save caller's user profile (frontend compatibility)
  public shared ({ caller }) func saveCallerUserProfile(profile : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    
    // Ensure the principalId matches the caller
    let callerText = caller.toText();
    if (profile.principalId != callerText) {
      Runtime.trap("Unauthorized: Cannot save profile for another user");
    };
    
    userProfiles.add(caller, profile);
  };

  // Get another user's profile (frontend compatibility)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?StudentProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };
};
