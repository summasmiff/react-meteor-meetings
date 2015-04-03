LikesCollection = new Mongo.Collection('likes');
ChangesCollection = new Mongo.Collection('changes');

var LikesAndChanges = ReactMeteor.createClass({
  templateName: 'LikesAndChanges',

  startMeteorSubscriptions: function() {
    Meteor.subscribe('likes');
    Meteor.subscribe('changes');
  },

  getInitialState: function() {
    return {
      date: new Date()
    };
  },

  getMeteorState: function() {
    return {
      likes: LikesCollection.find().fetch().reverse(),
      changes: ChangesCollection.find().fetch().reverse()
    };
  },

  handleLikeOrChangeClick: function(l_or_c) {
    if (l_or_c.type === 'Like') {
      Meteor.call('addLike', l_or_c.text, this.state.date);
    }
    if (l_or_c.type === 'Change') {
      Meteor.call('addChange', l_or_c.text, this.state.date);
    }
  },

  setDate: function(e) {
    var newDate = new Date(e.target.value);
    newDate.setDate(newDate.getDate() + 1);
    this.setState({date: new Date(newDate)});
  },

  render: function() {
    var formatedDate = this.state.date.getFullYear() + '-' +
        ('0' + (this.state.date.getMonth() + 1)).slice(-2) + '-' +
        ('0' + this.state.date.getDate()).slice(-2);
    return (
      <div className='likes-and-changes'>
        <div className='row date-row'>
          <form className='col date-form right'>
            <input type='date' value={formatedDate} className='datepicker' onChange={this.setDate}></input>
          </form>
        </div>
        <AddLikeOrChange onAddLikeOrChangeSubmit={this.handleLikeOrChangeClick}/>
        <div className='row'>
          <div className='col s6'>
            <Likes date={this.state.date} data={this.state.likes} />
          </div>
          <div className='col s6'>
            <Changes date={this.state.date} data={this.state.changes} />
          </div>
        </div>
      </div>
    );
  }
});

var AddLikeOrChange = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault(e);
    var type = $(document.activeElement)[0].value;
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text) {
      return;
    }
    this.props.onAddLikeOrChangeSubmit({type: type, text: text});
    this.refs.text.getDOMNode().value = '';
    return;
  },

  render: function() {
    return (
      <form className="add-like-or-change" onSubmit={this.handleSubmit}>
        <div className="row">
          <div className="input-field col s12">
            <textarea id="textarea1" className="materialize-textarea" ref='text'></textarea>
            <label htmlFor="textarea1">Like or Change?</label>
            <div className="row">
              <div className="col s6 center-align">
                <input className="btn-like btn waves-effect waves-light" type="submit" value="Like"></input>
              </div>
              <div className="col s6 center-align">
                <input className="btn-change btn waves-effect waves-light" type="submit" value="Change"></input>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
});

var Likes = React.createClass({
  render: function() {
    var today = this.props.date;
    var likeNodes = this.props.data.map(function(like, index) {
      if (like.createdAt.getFullYear() === today.getFullYear() &&
          like.createdAt.getMonth() === today.getMonth() &&
          like.createdAt.getDay() === today.getDay()) {
        return (
          <li key={index}>
            <Like likeObject={like} />
          </li>
        );
      }
    });
    return (
      <div className='like-list'>
        <ul className='fa-ul'>
          {likeNodes}
        </ul>
      </div>
    );
  }
});

var Changes = React.createClass({
  render: function() {
    var today = this.props.date;
    var changeNodes = this.props.data.map(function(change, index) {
      if (change.createdAt.getFullYear() === today.getFullYear() &&
          change.createdAt.getMonth() === today.getMonth() &&
          change.createdAt.getDay() === today.getDay()) {
        return (
          <li key={index}>
            <Change changeObject={change} />
          </li>
        );
      }
    });
    return (
      <div className='change-list'>
        <ul className='change-list fa-ul'>
          {changeNodes}
        </ul>
      </div>
    );
  }
});

var Like = React.createClass({
  handleDelete: function(e) {
    e.preventDefault(e);
    Meteor.call('deleteLike', this.props.likeObject._id);
  },

  render: function() {
    return (
      <div className='like'>
        <button className="delete" onClick={this.handleDelete}>&times;</button>
        <span>{this.props.likeObject.text}</span>
      </div>
    );
  }
});

var Change = React.createClass({
  handleDelete: function(e) {
    e.preventDefault(e);
    console.log('test');
    Meteor.call('deleteChange', this.props.changeObject._id);
  },

  render: function() {
    return (
      <div className='change'>
        <button className="delete" onClick={this.handleDelete}>&times;</button>
        <span>{this.props.changeObject.text}</span>
      </div>
    );
  }
});


Meteor.methods({
  addLike: function(text, date) {
    LikesCollection.insert({
      text: text,
      createdAt: date
    });
  },

  addChange: function(text, date) {
    ChangesCollection.insert({
      text: text,
      createdAt: date
    });
  },

  deleteLike: function(id) {
    LikesCollection.remove(id);
  },

  deleteChange: function(id) {
    ChangesCollection.remove(id);
  }
});

if (Meteor.isServer) {
  Meteor.publish('likes', function(){
    return LikesCollection.find();
  });
  Meteor.publish('changes', function(){
    return ChangesCollection.find();
  });
}
