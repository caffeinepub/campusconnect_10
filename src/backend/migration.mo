import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
    avatarUrl : Text;
    rollNumber : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, StudentProfile>;
  };

  type StudentProfile = {
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

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, StudentProfile>(
      func(_principal, oldProfile) {
        {
          principalId = "";
          name = oldProfile.name;
          email = "";
          mobile = "";
          course = "";
          yearOfDegree = "";
          division = "";
          rollNumber = oldProfile.rollNumber;
          department = "";
          bio = "";
          avatarUrl = oldProfile.avatarUrl;
          role = "";
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
