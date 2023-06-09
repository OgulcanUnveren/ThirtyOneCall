module.exports = (sequelize, Sequelize) => {
    const Call = sequelize.define("calls", {
      host: {
        type: Sequelize.STRING
      },
      guest: {
        type: Sequelize.STRING
      },
      
    });
    
    return Call;
  };


  