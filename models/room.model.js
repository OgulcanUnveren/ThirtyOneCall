module.exports = (sequelize, Sequelize) => {
    const Room = sequelize.define("rooms", {
      roomname: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.STRING
      },
      
    });
    
    return Room;
  };


  