class GroupSettingsController < Groups::ApplicationController
  before_action :set_group

  def show
    authorize! :update, @group
  end

  def update
    authorize! :update, @group

    params[:_by] ||= "show"
    if @group.update(group_params)
      redirect_to group_settings_path(@group), notice: "Group update successed"
    else
      render params[:_by]
    end
  end

  def destroy
    authorize! :destroy, @group

    @group.destroy
    redirect_to root_path, notice: "Group has deleted"
  end

  private
    def group_params
      params.require(:group).permit(:name, :description, :location, :url, :avatar, :slug)
    end
end