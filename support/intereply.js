exports.InteractionReply = class {
  #replyContent = 'Responding to command'; // empty replies cannot be sent so use some placeholder
  #isHidden = true;
  #then = (() => { });
  #embedContent = [];
  #baseInteraction;
  #files = [];
  /**
   * 
   * @param {Discord.CommandInteraction} interaction the base interaction
   * to reply to
   */
  constructor(interaction) {
    this.#baseInteraction = interaction;
  }

  withReplyContent(newReply) {
    this.#replyContent = newReply; 
    return this;
  }

  withHidden(isHidden) {
    this.#isHidden = isHidden;
    return this;
  }

  withThen(thenable) {
    this.#then = thenable;
    return this;
  }

  withEmbedContent(embeds) {
    this.#embedContent = embeds;
    return this;
  }

  withFiles(files) {
    this.#files = files;
    return this;
  }

  // TODO should there be an async version? should that be the only version?
  /**
   * Finalize this reply. Note that this does not wait for the completion
   * of the reply - that will have to be done explicitly
   */
  replyTo() {
    const interaction = this.#baseInteraction;
    const reply = this.#replyContent;
    const ephemeral = this.#isHidden;
    const thenable = this.#then;
    const embeds = this.#embedContent;
    const files = this.#files;
    const replyConfig = { 
      embeds: embeds,
      content: reply,
      ephemeral: ephemeral,
      files: files 
    };

    // TODO refactor me
    if (interaction.replied) {
      interaction.followUp(replyConfig)
        .then(thenable)
        .catch(err => {
          console.log(`Could not followup to interaction due to: ${err}`);
        });
      return;
    }

    interaction.reply(replyConfig)
      .then(thenable)
      .catch(err => {
        console.log(`Could not reply to interaction due to: ${err}`);
      });
  }
}